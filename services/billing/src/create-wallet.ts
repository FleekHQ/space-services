import { APIGatewayProxyResult } from 'aws-lambda';
import { BillingModel } from '@packages/models';
import { processRequest } from '@packages/apitools';
import { CreateWalletResponse } from './types';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;
const billingDb = new BillingModel(STAGE);

export const createWallet = async (): Promise<APIGatewayProxyResult> => {
  const result = await processRequest(
    async (): Promise<CreateWalletResponse> => {
      const key = await billingDb.createWallet();

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

export default createWallet;
