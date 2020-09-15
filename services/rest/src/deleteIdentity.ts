import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

const identityNotFoundResponse = {
  statusCode: 404,
  body: JSON.stringify({ message: 'Identity was not found.' }),
};

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  try {
    await identityDb.deleteIdentityByUuid(uuid);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'ok',
      }),
    };
  } catch (e) {
    console.log(e);
    return identityNotFoundResponse;
  }
};
