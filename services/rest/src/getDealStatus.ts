import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import cors from '@middy/http-cors';

import Appsync from 'aws-appsync';
import gql from 'graphql-tag';
import { AuthContext } from './authorizer';

require('cross-fetch/polyfill');

const graphqlClient = new Appsync({
  url: process.env.APPSYNC_URL,
  region: process.env.AWS_REGION,
  auth: {
    type: 'AWS_IAM',
    credentials: {
      // is there a way to get these from the lambda role
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      // is this needed?
      // sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  },
  disableOffline: true,
});

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { hash } = JSON.parse(event.body);

  let res;
  try {
    const query = gql(`query getDealStatus($hash: String!) {
      getDealStatus(hash: $hash) {
        proposalCid
        state
        duration
        dealId
        creationTime
      }
    }`);

    res = await graphqlClient.query({
      query,
      variables: {
        hash,
      },
    });
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Unable to fetch deal: ${e.toString()}` }),
    };
  }

  const response = {
    statusCode: 201,
    body: JSON.stringify(res),
  };

  return response;
}).use(cors());
