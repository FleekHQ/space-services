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
  const { uuid } = event.requestContext.authorizer;

  const result = await identityDb.getAddressesByUuid(uuid);

  // exclude main
  const data = result.filter(a => a.provider && a.provider !== 'main');

  const response = {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };

  return response;
}).use(cors());
