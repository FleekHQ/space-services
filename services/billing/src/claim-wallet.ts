import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
import { BillingModel } from '@packages/models';
import { processRequest } from '@packages/apitools';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;
const billingDb = new BillingModel(STAGE);

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

export const claimWallet = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const { uuid } = event.requestContext.authorizer;
  const { key } = event.pathParameters;

  const result = await processRequest(
    async (): Promise<void> => {
      // This will throw if the wallet is not found
      await billingDb.claimWallet(key, uuid);
    }
  );

  return result;
};

export default claimWallet;
