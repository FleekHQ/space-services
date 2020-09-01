import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  VaultModel,
  UnauthorizedError,
  ValidationError,
} from '@packages/models';
import { processRequest } from '@packages/apitools';
import { RetrieveVaultRequest, RetrieveVaultResponse } from './types';
import { computeVskHash } from './shared';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;

const vaultDb = new VaultModel(STAGE);

const incorrectUuidOrPass = new UnauthorizedError(
  'Incorrect uuid or password.'
);

export const retrieveVault = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<RetrieveVaultResponse> => {
      const request: RetrieveVaultRequest = JSON.parse(event.body);
      const { vsk } = request;
      const { uuid } = event.pathParameters;

      if (!uuid || uuid === '') {
        throw new ValidationError('uuid cannot be blank.');
      }

      // We compute the vsk hash again. If it doesn't match the stored one,
      // it means either the uuid or the password is wrong.
      const vskHash = computeVskHash(vsk, uuid);
      let storedVault;
      try {
        storedVault = await vaultDb.getVaultByUuid(uuid);
      } catch (error) {
        // The stored vault was not found
        throw incorrectUuidOrPass;
      }

      if (vskHash.toString('hex') !== storedVault.kdfHash) {
        throw incorrectUuidOrPass;
      }

      // If we are here, it means the password is correct
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

export default retrieveVault;
