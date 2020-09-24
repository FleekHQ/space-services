/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BillingModel } from '@packages/models';
import createStripe from '../utils/stripe';

const STAGE = process.env.ENV;

const billingDb = new BillingModel(STAGE);
const stripe = createStripe();

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      event.headers['stripe-signature'],
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

  switch (stripeEvent.type) {
    case 'invoice.paid':
      // @todo: add relevant amount of credits
      // Used to provision services after the trial has ended.
      // The status of the invoice will show up as paid. Store the status in your
      // database to reference when a user accesses your service to avoid hitting rate limits.
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
};
