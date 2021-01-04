import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel, ValidationError } from '@packages/models';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

interface UpdateIdentityPayload {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

const identityNotFoundResponse = {
  statusCode: 404,
  body: JSON.stringify({ message: 'Identity was not found.' }),
};

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  const payload: UpdateIdentityPayload = JSON.parse(event.body);

  try {
    const data = await identityDb.updateIdentity(uuid, payload);

    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
      }),
    };
  } catch (e) {
    console.log(e);

    if (e instanceof ValidationError) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: 'Username already exists',
        }),
      };
    }

    return identityNotFoundResponse;
  }
}).use(cors());
