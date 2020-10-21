/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
import createDbModel from '@packages/models/dist/billing/dbModel';
import createStripe from '../utils/stripe';

const STAGE = process.env.ENV;

const dbModel = createDbModel(STAGE);
const stripe = createStripe();

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const { uuid } = event.requestContext.authorizer;
  const account = await dbModel.getOrCreateAccount(uuid);

  if (!account.stripeSubscriptionId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Subscription was not found for this account.',
      }),
    };
  }

  await stripe.subscriptions.del(account.stripeSubscriptionId);

  // remove subscription from account
  await dbModel.updateAccount(account.id, {
    stripeSubscriptionId: null,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Subscription was cancelled.',
    }),
  };
};
