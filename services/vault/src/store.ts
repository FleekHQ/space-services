import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
import { VaultModel, UnauthorizedError } from '@packages/models';
import { processRequest } from '@packages/apitools';
import { StoreVaultRequest } from './types';
import { computeVskHash } from './shared';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;
const vaultDb = new VaultModel(STAGE);

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<void> => {
      const request: StoreVaultRequest = JSON.parse(event.body);
      const { vault, vsk, type } = request;
      const { uuid } = event.requestContext.authorizer;

      if (!uuid || uuid === '') {
        throw new UnauthorizedError('Authorization token is invalid.');
      }

      console.log('storing vault for', { vault, vsk });

      // Store vskHash together with the vault
      await vaultDb.storeVault({
        uuid,
        // If vsk is provided: calculate the key we store in the db to check if the user is providing the correct password
        // when retreiving the vault later on
        kdfHash: vsk ? computeVskHash(vsk, uuid).toString('hex') : null,
        vault,
        type,
      });
    },
    {
      successCode: 201,
    }
  );

  return result;
};
