import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel, VaultModel } from '@packages/models';
import { processRequest } from '@packages/apitools';
import crypto from 'crypto';
import { StoreVaultRequest } from './types';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const saltSecret = process?.env?.SALT_SECRET;
if (!saltSecret || saltSecret === '') {
  throw new Error('SALT_SECRET variable not set');
}

const STAGE = process.env.ENV;

const identityDb = new IdentityModel(STAGE);
const vaultDb = new VaultModel(STAGE);

export const storeVault = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<void> => {
      const request: StoreVaultRequest = JSON.parse(event.body);
      const { uuid, vault, vsk } = request;

      // TODO: Verify JWT.uuid === uuid

      // Calculate the key we store in the db to check if the user is providing the correct password
      // when retreiving the vault later on.
      const vskHash = crypto.pbkdf2Sync(
        vsk, // vsk should already be a secure password since it went through a kdf in the client side.
        saltSecret + uuid, // In the event that keys got leaked, a brute force attacker would also need the saltSecret to be able to brute force
        1_000_000, // Running 1.000.000 iterations takes about a second (at least in the year 2020)
        64,
        'sha512'
      );

      // Store vskHash together with the vault
      await vaultDb.storeVault({
        uuid,
        kdfHash: vskHash.toString('hex'),
        vault,
      });
    },
    {
      successCode: 201,
    }
  );

  return result;
};

export default storeVault;
