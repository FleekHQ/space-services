/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { BillingModel } from '@packages/models';
import createStripe from './utils/stripe';

const STAGE = process.env.ENV;

const billingDb = new BillingModel(STAGE);
const stripe = createStripe();

interface CreateStripeCustomerPayload {
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
  const payload: CreateStripeCustomerPayload = JSON.parse(event.body);
  const { uuid } = event.requestContext.authorizer;

  let info;

  try {
    info = await billingDb.getStripeInfoByEmail(payload.email);

    if (info.ownerUuid !== uuid) {
      // @question: do we need to handle state when info exists, but uuid (= key pair) does not match?
    }
  } catch (e) {
    const customer = await stripe.customers.create({
      email: payload.email,
    });

    info = await billingDb.saveStripeInfo(payload.email, customer.id, uuid);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(info),
  };
};
