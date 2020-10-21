import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
import createDbModel from '@packages/models/dist/billing/dbModel';
import { accountResponse } from './utils/responses';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;
const dbModel = createDbModel(STAGE);

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const { uuid } = event.requestContext.authorizer;
  const account = await dbModel.getOrCreateAccount(uuid);

  return {
    statusCode: 200,
    body: JSON.stringify(accountResponse(account)),
  };
};
