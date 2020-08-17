import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

interface ChangeUsernamePayload {
  username: string;
}

export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  const payload: ChangeUsernamePayload = JSON.parse(event.body);

  if (!payload.username) {
    return { statusCode: 403, body: 'Invalid Request', isBase64Encoded: false };
  }

  try {
    await identityDb.changeUsername(uuid, payload.username);

    const response = {
      statusCode: 200,
      body: 'OK',
      isBase64Encoded: false,
    };

    return response;
  } catch (e) {
    return {
      statusCode: 404,
      body: 'Not found',
      isBase64Encoded: false,
    };
  }
};
