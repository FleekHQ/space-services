import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel, ValidationError } from '@packages/models';
import { processRequest } from '@packages/apitools';
import { isValidAddress } from '@packages/crypto';
import { IdentityResult, GetIdentitiesResponse } from './types';

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

export const getIdentities = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<GetIdentitiesResponse> => {
      if (!event.queryStringParameters) {
        throw new ValidationError(
          'Param `keys` is required in the query string.'
        );
      }
      const { keys } = event.queryStringParameters;

      const addressOrUsernames = keys.split(',');

      if (addressOrUsernames.length > 20) {
        throw new ValidationError(
          'A maximum of 20 identities can be fetched at a time.'
        );
      }

      const identityMap: GetIdentitiesResponse = {};

      const identityPromises = addressOrUsernames.map(async key => {
        let identity = null;

        if (isValidAddress(key)) {
          try {
            identity = await identityDb.getIdentityByAddress(key);
            delete identity.createdAt;
          } catch {
            // Ignore if not found.
          }
        } else {
          try {
            identity = await identityDb.getIdentityByUsername(key);
            delete identity.createdAt;
          } catch {
            // Ignore if not found.
          }
        }

        identityMap[key] = identity;
      });

      // TODO: Find a way to parallelize queries.
      // Can't use BatchGetItem since we are querying over both primary keys and GSI
      await Promise.all(identityPromises);

      return identityMap;
    }
  );

  return result;
};
