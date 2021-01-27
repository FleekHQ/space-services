/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

const queryBy = {
  address: (str: string) => identityDb.getIdentityByAddress(str),
  username: (str: string) => identityDb.getIdentityByUsername(str),
  email: (str: string) => identityDb.getIdentityByEmail(str),
};

type FilterKey = 'address' | 'email' | 'username';

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { address, username, email } = event.queryStringParameters;

  if (!address && !username && !email) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error:
          'You need to use "address" or "username" or "email" as query string parameter.',
      }),
    };
  }

  let filterKey: FilterKey;

  if (address) {
    filterKey = 'address';
  } else if (username) {
    filterKey = 'username';
  } else {
    filterKey = 'email';
  }

  const values = event.queryStringParameters[filterKey].split(',');

  if (values.length > 20) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'You can filter by max. 20 addresses or usernames.',
      }),
    };
  }

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
}).use(cors());
