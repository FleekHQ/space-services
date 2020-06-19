import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { processRequest } from '@packages/apitools';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;

const identityDb = new IdentityModel(STAGE);

export const getIdentityByUsername = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(async () => {
    console.log('got event', event);

    const { username } = event.pathParameters;

    const identity = await identityDb.getIdentityByUsername(username);
    return identity;
  });

  return result;
};

export const getIdentityByAddress = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(async () => {
    console.log('got event', event);

    const { address } = event.pathParameters;

    const identity = await identityDb.getIdentityByAddress(address);
    return identity;
  });

  return result;
};
