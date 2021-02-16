import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import AWS from 'aws-sdk';
import { AuthContext } from './authorizer';
import render from './emails';
import { EmailBody } from './emails/emailTypes';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

const ses = new AWS.SES({ region: 'us-west-2' });

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { mail } = JSON.parse(event.body);

  const emailBody: EmailBody = render(mail);

  let ToAddresses;
  if (Array.isArray(mail.toAddresses)) {
    ToAddresses = mail.toAddresses;
  } else {
    ToAddresses = [mail.toAddresses];
  }

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
    Source: emailBody.from || 'Space <hi@space.storage>',
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
