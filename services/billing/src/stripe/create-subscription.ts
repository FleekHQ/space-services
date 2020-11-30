/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel, createBillingModel } from '@packages/models';
import createStripe from '../utils/stripe';

const STAGE = process.env.ENV;

const dbModel = createBillingModel(STAGE);
const identityDb = new IdentityModel(STAGE);
const stripe = createStripe();

interface CreateStripeSubscriptionPayload {
  paymentMethodId: string;
  priceId?: string;
  email: string;
  username: string;
}

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const payload: CreateStripeSubscriptionPayload = JSON.parse(event.body);

  const identity = await identityDb.getIdentityByUsername(payload.username);
  const { uuid } = identity;

  const account = await dbModel.getOrCreateAccount(uuid);

  let stripeCustomerId;
  let stripeCustomer;

  const priceId = payload.priceId || 'space_pro';

  // if user already have billing account & stripe id
  if (account.billingAccount && account.billingAccount.stripeCustomerId) {
    stripeCustomerId = account.billingAccount.stripeCustomerId;
  } else {
    try {
      const dbStripeCustomer = await dbModel.getStripeCustomer(payload.email);
      stripeCustomerId = dbStripeCustomer.stripeCustomerId;
    } catch (e) {
      stripeCustomer = await stripe.customers.create({
        email: payload.email,
      });

      stripeCustomerId = stripeCustomer.id;

      await dbModel.saveStripeCustomer(payload.email, uuid, stripeCustomer.id);
    }
  }

  // attach payment method to stripe customer
  try {
    await stripe.paymentMethods.attach(payload.paymentMethodId, {
      customer: stripeCustomerId,
    });
  } catch (error) {
    return {
      statusCode: 402,
      body: JSON.stringify({
        error: { message: error.message },
      }),
    };
  }

  // Change the default invoice settings on the customer to the new payment method
  await stripe.customers.update(stripeCustomerId, {
    // eslint-disable-next-line
    invoice_settings: {
      // eslint-disable-next-line
      default_payment_method: payload.paymentMethodId,
    },
  });

  const paymentMethodData = await stripe.paymentMethods.retrieve(
    payload.paymentMethodId
  );

  let card = null;

  if (paymentMethodData.card) {
    card = {
      brand: paymentMethodData.card.brand,
      expMonth: paymentMethodData.card.exp_month,
      expYear: paymentMethodData.card.exp_year,
      last4: paymentMethodData.card.last4,
      issuer: paymentMethodData.card.issuer,
    };
  }

  const stripePaymentMethodMeta = {
    card,
    type: paymentMethodData.type,
  };

  // update billing account info
  await dbModel.updateBillingAccount(account.billingAccountId, {
    stripePaymentMethodId: payload.paymentMethodId,
    stripePaymentMethodMeta,
    stripeCustomerId,
    email: payload.email,
  });

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  // save subscription relation to user uuid
  await dbModel.saveStripeSubscription({
    id: subscription.id,
    accountId: account.id,
    stripeCustomerId,
    priceId,
    billingAccountId: account.billingAccountId,
  });

  return {
    statusCode: 201,
    body: JSON.stringify(subscription),
  };
};
