import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { processRequest } from '@packages/apitools';
import { IdentityResult } from './types';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;

const identityDb = new IdentityModel(STAGE);

export const getIdentityByUsername = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<IdentityResult> => {
      console.log('got event', event);

      const { username } = event.pathParameters;

      const identity = await identityDb.getIdentityByUsername(username);
      delete identity.createdAt;
      return identity;
    }
  );

  return result;
};

export const getIdentityByAddress = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<IdentityResult> => {
      const { address } = event.pathParameters;

      const identity = await identityDb.getIdentityByAddress(address);
      delete identity.createdAt;
      return identity;
    }
  );

  return result;
};
