import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
// import createDbModel from '@packages/models/dist/billing/dbModel';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

// const STAGE = process.env.ENV;
// const dbModel = createDbModel(STAGE);

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const { uuid } = event.requestContext.authorizer;

  console.log(uuid);

  return {
    statusCode: 200,
    body: JSON.stringify({
      storage: Math.ceil(Math.random() * 1000000000),
      bandwidth: Math.ceil(Math.random() * 10000000),
    }),
  };
};
