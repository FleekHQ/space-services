import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

interface AddEthAddress {
  address: string;
  provider: string;
  metadata: any;
}

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  const payload: AddEthAddress = JSON.parse(event.body);

  await identityDb.addEthAddress(uuid, payload);

  const response = {
    statusCode: 201,
    body: JSON.stringify({ data: 'OK' }),
  };

  return response;
};