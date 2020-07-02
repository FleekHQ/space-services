import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { processRequest } from '@packages/apitools';
import { CreateIdentityRequest, IdentityResult } from './types';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;

const identityDb = new IdentityModel(STAGE);

export const createIdentity = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<IdentityResult> => {
      const request: CreateIdentityRequest = JSON.parse(event.body);

      const identity = await identityDb.createIdentity(request);
      delete identity.createdAt;
      return identity;
    },
    {
      successCode: 201,
    }
  );

  return result;
};

export default createIdentity;
