import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

enum ProofType {
  email = 'email',
}

interface CreateProofPayload {
  type: ProofType;
  value: string;
}

const identityNotFoundResponse = {
  statusCode: 404,
  body: JSON.stringify({ message: 'Identity was not found.' }),
};

export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  const payload: CreateProofPayload = JSON.parse(event.body);

  if (!payload.type || !payload.value) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Fields "type" and "value" are required.',
      }),
    };
  }

  if (payload) {
    try {
      await identityDb.createProof({ uuid, ...payload });
    } catch (e) {
      console.log(e);
      return identityNotFoundResponse;
    }
  }

  const response = {
    statusCode: 201,
    body: JSON.stringify({ data: 'OK' }),
  };

  return response;
};
