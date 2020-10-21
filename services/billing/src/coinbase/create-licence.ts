import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BillingModel, IdentityModel } from '@packages/models';
import { processRequest } from '@packages/apitools';
import { CreateWalletResponse } from '../types';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

interface CreateCoinbaseLicencePayload {
  username?: string;
}

const STAGE = process.env.ENV;
const billingDb = new BillingModel(STAGE);
const identityDb = new IdentityModel(STAGE);

// eslint-disable-next-line
export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<CreateWalletResponse> => {
      const payload: CreateCoinbaseLicencePayload =
        event.body && JSON.parse(event.body);

      let uuid;

      if (payload.username) {
        const identity = await identityDb.getIdentityByUsername(
          payload.username
        );

        uuid = identity.uuid;
      }
      const key = await billingDb.createWallet();

      if (uuid) {
        await billingDb.claimWallet(key, uuid);
      }

      return {
        key,
      };
    },
    {
      successCode: 201,
    }
  );

  return result;
};
