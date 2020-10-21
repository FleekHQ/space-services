/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BillingModel } from '@packages/models';
import { Webhook } from 'coinbase-commerce-node';

const STAGE = process.env.ENV;
const { WEBHOOK_SECRET } = process.env;

const billingDb = new BillingModel(STAGE);

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('Headers', event.headers);

  const signature = event.headers['X-CC-Webhook-Signature'];

  try {
    Webhook.verifySigHeader(event.body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.log(err);
    console.log(`⚠️  Webhook signature verification failed.`);
    console.log(`⚠️  Check the env file and enter the correct webhook secret.`);

    return {
      statusCode: 400,
      body: 'Invalid request',
    };
  }

  // const jsonBody = JSON.parse(event.body);

  billingDb.addCredits('1', 10);

  return {
    statusCode: 200,
    body: 'OK',
  };
};
