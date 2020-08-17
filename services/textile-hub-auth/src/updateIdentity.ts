import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

interface UpdateIdentityPayload {
  displayName: string;
}

export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  const payload: UpdateIdentityPayload = JSON.parse(event.body);

  try {
    await identityDb.updateIdentity(uuid, payload);

    const response = {
      statusCode: 200,
      body: 'OK',
      isBase64Encoded: false,
    };

    return response;
  } catch (e) {
    console.log(e);

    return {
      statusCode: 404,
      body: 'Not found',
      isBase64Encoded: false,
    };
  }
};
