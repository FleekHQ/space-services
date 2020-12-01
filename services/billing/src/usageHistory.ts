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

  const mockData = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 30; i += 1) {
    mockData.push({
      date: new Date(now - i * day).toISOString(),
      usage: Math.ceil(Math.random() * 1000000000),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(mockData),
  };
};
