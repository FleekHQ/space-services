import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  VaultModel,
  IdentityModel,
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
const identityDb = new IdentityModel(STAGE);
const incorrectUuidOrPass = new UnauthorizedError(
  'Incorrect uuid or password.'
);

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<RetrieveVaultResponse> => {
      const request: RetrieveVaultRequest = JSON.parse(event.body);
      const { vsk } = request;
      let { uuid, type } = event.pathParameters;

      if (!uuid || uuid === '') {
        throw new ValidationError('uuid cannot be blank.');
      }

      if (!type || type === '') {
        type = 'password';
      }

      console.log('retrieve for', { uuid, vsk });

      // if uuid matches eth address, we try to resolve uuid from address
      if (uuid.startsWith('0x') && uuid.length === 42) {
        const identity = await identityDb.getIdentityByAddress(uuid);

        if (identity) {
          uuid = identity.uuid;
          console.log('uuid sets to', uuid);
        }
      }

      // We compute the vsk hash again. If it doesn't match the stored one,
      // it means either the uuid or the password is wrong.
      const vskHash = computeVskHash(vsk, uuid);
      let storedVault;
      try {
        storedVault = await vaultDb
          .getVaultByUuid(uuid, type)
          .catch(() => vaultDb.getVaultByUuid(uuid, null));
      } catch (error) {
        // The stored vault was not found
        console.log('vault was not found');
        throw incorrectUuidOrPass;
      }

      // if kdfHash is not set or not matching user input we throw an error
      if (
        !storedVault.kdfHash ||
        vskHash.toString('hex') !== storedVault.kdfHash
      ) {
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
