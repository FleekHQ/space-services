/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const query = JSON.parse(event.body);

  if (!query || query.length < 1) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error:
          'You need to supply type=email/username/displayName and value to query.',
      }),
    };
  }

  const data = await identityDb.getIdentities(query);

  const response = {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };

  return response;
}).use(cors());
