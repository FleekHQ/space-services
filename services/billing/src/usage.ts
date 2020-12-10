import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
import { Context } from '@textile/context';
import { Users } from '@textile/users';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

// const STAGE = process.env.ENV;
// const dbModel = createDbModel(STAGE);

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

const { TestIdentity } = require('./id');

(async () => {
  // set users key
  // users.context.withAPIKey(TestIdentity.public.toString());

  console.log(users.context);
  try {
    console.log('usage', JSON.stringify(usage.customer));
  } catch (e) {
    console.log(e);
  }
})();

const ctx = new Context('http://52.11.247.86:3007');

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const { uuid, pubkey } = event.requestContext.authorizer;

  try {
    const users = await Users.withKeyInfo(
      {
        key: 'bwmvr74ev3sqmnj5hchooa2zkzm',
        secret: 'byiyrna6l3wnfdp4a7aaxsiz573jrtuvrz3qhj6a',
      },
      ctx
    );

    const usage = await users.getUsage({
      dependentUserKey: TestIdentity.public.toString(),
    });
  } catch (e) {
    // zero usage
  }
  console.log(uuid);

  return {
    statusCode: 200,
    body: JSON.stringify({
      storage: Math.ceil(Math.random() * 1000000000),
      bandwidth: Math.ceil(Math.random() * 10000000),
    }),
  };
};
