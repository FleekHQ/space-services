/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import { createBillingModel, createNotificationsModel } from '@packages/models';
import { BillingMode } from '@packages/models/dist/billing/ap/account';
import _ from 'lodash';
import createStripe from '../utils/stripe';
import { accountResponse } from '../utils/responses';

const STAGE = process.env.ENV;
const { PRO_PLAN_ID } = process.env;

const billingDb = createBillingModel(STAGE);
const notificationsDb = createNotificationsModel(STAGE);
const stripe = createStripe();

const apig = new AWS.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: process.env.APIG_ENDPOINT,
});

const sendMessageToClient = (
  connectionId: string,
  payload: object
): Promise<object> =>
  apig
    .postToConnection({
      ConnectionId: connectionId, // connectionId of the receiving ws-client
      Data: JSON.stringify(payload),
    })
    .promise();

const okStatus = {
  statusCode: 200,
  body: 'OK',
};

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  let stripeEvent;

  console.log('Headers', event.headers);

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      event.headers['Stripe-Signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(err);
    console.log(`⚠️  Webhook signature verification failed.`);
    console.log(`⚠️  Check the env file and enter the correct webhook secret.`);

    return {
      statusCode: 400,
      body: 'Invalid request',
    };
  }

  const subscriptionId = _.get(
    stripeEvent,
    ['data', 'object', 'subscription'],
    null
  );

  let subscription;

  switch (stripeEvent.type) {
    case 'invoice.paid':
      try {
        subscription = await billingDb.getStripeSubscription(subscriptionId);
      } catch (e) {
        return okStatus;
      }

      try {
        const lines = _.get(
          stripeEvent,
          ['data', 'object', 'lines', 'data'],
          []
        );

        const spaceProPlan = lines
          .filter((l: any) => l.plan && l.plan.id === PRO_PLAN_ID)
          .pop();

        if (spaceProPlan) {
          const billingPeriodStart = new Date(
            _.get(spaceProPlan, ['period', 'start']) * 1000
          ).toISOString();
          const billingPeriodEnd = new Date(
            _.get(spaceProPlan, ['period', 'end']) * 1000
          ).toISOString();

          await billingDb.updateAccount(subscription.accountId, {
            plan: subscription.plan,
            billingPeriodStart,
            billingPeriodEnd,
            estimatedCost: _.get(spaceProPlan, ['plan', 'amount']),
            stripeSubscriptionId: subscription.id,
            billingMode: BillingMode.STRIPE,
          });

          // todo store payment under billing account

          try {
            // @todo for team accounts we need to iterate over members

            const connection = await notificationsDb.getConnectionByUuid(
              subscription.accountId
            );

            const account = await billingDb.getOrCreateAccount(
              subscription.accountId
            );

            const data = accountResponse(account);

            console.log('found a connection', connection);
            await sendMessageToClient(connection.connectionId, {
              type: 'account',
              data,
            });
          } catch (e) {
            console.log('error when sending a notification', e);
          }
        }
      } catch (e) {
        console.log('Error', e);
        return {
          statusCode: 404,
          body: JSON.stringify({ message: e.message }),
        };
      }
      break;
    case 'invoice.payment_failed':
      // If the payment fails or the customer does not have a valid payment method,
      //  an invoice.payment_failed event is sent, the subscription becomes past_due.
      // Use this webhook to notify your user that their payment has
      // failed and to retrieve new card details.
      break;
    case 'customer.subscription.deleted':
      if (stripeEvent.request != null) {
        // handle a subscription cancelled by your request
        // from above.
      } else {
        // handle subscription cancelled automatically based
        // upon your subscription settings.
      }
      break;
    default:
    // Unexpected event type
  }

  return okStatus;
};
