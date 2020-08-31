import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

const queryBy = {
  address: (str: string) => identityDb.getIdentityByAddress(str),
  username: (str: string) => identityDb.getIdentityByUsername(str),
};

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { address, username } = event.queryStringParameters;

  console.log(event.queryStringParameters);

  if (!address && !username) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error:
          'You need to use "address" or "username" as query string parameter.',
      }),
    };
  }

  const filterKey = address ? 'address' : 'username';
  const values = event.queryStringParameters[filterKey].split(',');

  let data = await Promise.all(
    values.map(val => queryBy[filterKey](val).catch(() => null))
  );

  if (data.length === 1) {
    data = data.pop();

    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Identity not found.',
        }),
      };
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };

  return response;
};
