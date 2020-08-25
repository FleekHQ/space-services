import {
  CustomAuthorizerResult,
  Callback,
  Context,
  CustomAuthorizerEvent,
} from 'aws-lambda';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

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
export const handler = async function(
  event: CustomAuthorizerEvent,
  _context: Context,
  callback: Callback<CustomAuthorizerResult>
) {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Retrieve request parameters from the Lambda function input:
  const token = event.authorizationToken;

  if (!token) {
    callback('Unauthorized request');
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
    callback('Unauthorized request');
  }
};

// const generateDeny = function(principalId, resource) {
//   return generatePolicy(principalId, 'Deny', resource);
// };
