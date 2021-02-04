import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

interface AddEthAddress {
  address: string;
  provider: string;
  metadata: any;
}

const PROVIDERS_WITH_EMAIL = ['email', 'google', 'twitter'];

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  const payload: AddEthAddress = JSON.parse(event.body);

  try {
    await identityDb.addEthAddress(uuid, payload);
  } catch (e) {
    return {
      statusCode: 409,
      body: JSON.stringify({ error: 'Already in use.' }),
    };
  }

  if (
    PROVIDERS_WITH_EMAIL.includes(payload.provider) &&
    payload.metadata &&
    payload.metadata.email
  ) {
    await identityDb.storeEmail(uuid, payload.metadata.email, true);
  }

  const response = {
    statusCode: 201,
    body: JSON.stringify({ data: 'OK' }),
  };

  return response;
}).use(cors());
