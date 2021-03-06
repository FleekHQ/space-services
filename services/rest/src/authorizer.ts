import {
  CustomAuthorizerResult,
  Callback,
  Context,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

const generatePolicy = function(
  principalId: string,
  effect: string,
  resource: string,
  context: AuthContext
): CustomAuthorizerResult {
  // Required output:
  const authResponse: any = {
    principalId,
    context,
  };

  authResponse.principalId = principalId;

  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    };

    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};

const generateAllow = (
  principalId: string,
  resource: string,
  context: AuthContext
): CustomAuthorizerResult =>
  generatePolicy(principalId, 'Allow', resource, context);

// eslint-disable-next-line
export const handler = function(
  event: APIGatewayTokenAuthorizerEvent,
  _context: Context,
  callback: Callback<CustomAuthorizerResult>
) {
  // Retrieve request parameters from the Lambda function input:
  const token = event.authorizationToken;

  if (!token) {
    callback('Unauthorized');
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthContext;

    callback(
      null,
      generateAllow('me', event.methodArn, {
        pubkey: decoded.pubkey,
        uuid: decoded.uuid,
      })
    );
  } catch (e) {
    callback('Unauthorized');
  }
};
