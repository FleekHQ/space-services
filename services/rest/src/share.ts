import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import AWS from 'aws-sdk';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

const ses = new AWS.SES({ region: 'us-west-2' });

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  const params: AWS.SES.SendEmailRequest = {
    Destination: {
      ToAddresses,
    },
    Message: {
      Body: {
        Text: { Data: emailBody.text || '' },
        Html: {
          Data: emailBody.html,
        },
      },
      Subject: { Data: emailBody.subject },
    },
    Source: emailBody.from || 'Fleek <hi@fleek.co>',
  };

  try {
    await ses.sendEmail(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (e) {
    console.log(e);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}).use(cors());
