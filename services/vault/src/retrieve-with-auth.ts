import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import {
  VaultModel,
  UnauthorizedError,
  ValidationError,
} from '@packages/models';
import { processRequest } from '@packages/apitools';
import { RetrieveVaultResponse } from './types';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

interface AuthContext {
  uuid: string;
  pubkey: string;
}

const STAGE = process.env.ENV;

const vaultDb = new VaultModel(STAGE);

const incorrectUuidOrPass = new UnauthorizedError(
  'No usable backup stored for this user.'
);

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<RetrieveVaultResponse> => {
      const { uuid } = event.requestContext.authorizer;

      if (!uuid || uuid === '') {
        throw new ValidationError('uuid cannot be blank.');
      }

      let storedVault;
      try {
        storedVault = await vaultDb.getVaultByUuid(uuid);
      } catch (error) {
        // The stored vault was not found
        throw incorrectUuidOrPass;
      }

      // if there was password used for vault, we throw an error
      if (storedVault.kdfHash) {
        throw incorrectUuidOrPass;
      }

      return {
        encryptedVault: storedVault.vault,
      };
    },
    {
      successCode: 201,
    }
  );

  return result;
};
