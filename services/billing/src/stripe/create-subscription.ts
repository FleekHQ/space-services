/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { BillingModel } from '@packages/models';
import createStripe from '../utils/stripe';

const STAGE = process.env.ENV;

const billingDb = new BillingModel(STAGE);
const stripe = createStripe();

interface CreateStripeSubscriptionPayload {
  paymentMethodId: string;
  priceId: string;
  email: string;
}

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const payload: CreateStripeSubscriptionPayload = JSON.parse(event.body);

  let info;

  try {
    info = await billingDb.getStripeInfoByEmail(payload.email);
  } catch (e) {
    const customer = await stripe.customers.create({
      email: payload.email,
    });

    info = await billingDb.saveStripeInfo(payload.email, customer.id);
  }

  const key = await billingDb.createWallet();

  try {
    await stripe.paymentMethods.attach(payload.paymentMethodId, {
      customer: info.stripeCustomerId,
    });
  } catch (error) {
    return {
      statusCode: 402,
      body: JSON.stringify({ error: { message: error.message } }),
    };
  }

  // Change the default invoice settings on the customer to the new payment method
  await stripe.customers.update(info.stripeCustomerId, {
    // eslint-disable-next-line
    invoice_settings: {
      // eslint-disable-next-line
      default_payment_method: info.stripeCustomerId,
    },
  });

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: info.stripeCustomerId,
    items: [{ price: payload.priceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  await billingDb.saveStripeSubscription(
    subscription.id,
    info.stripeCustomerId,
    key
  );

  return {
    statusCode: 201,
    body: JSON.stringify({
      subscription,
      key,
    }),
  };
};
