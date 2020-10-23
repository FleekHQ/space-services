import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import { createNotificationsModel } from '@packages/models';

(global as any).WebSocket = require('isomorphic-ws');

interface TokenRequestPayload {
  data: {
    token: string;
  };
}

interface AuthContext {
  uuid: string;
  pubkey: string;
}

const STAGE = process.env.ENV;
const { JWT_SECRET } = process.env;

const notificationsDb = createNotificationsModel(STAGE);

const apig = new AWS.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: process.env.APIG_ENDPOINT,
});

const sendMessageToClient = (
  connectionId: string,
  payload: object
): Promise<object> =>
  apig
    .postToConnection({
      ConnectionId: connectionId, // connectionId of the receiving ws-client
      Data: JSON.stringify(payload),
    })
    .promise();

const statusResponse = { statusCode: 200, body: '' };

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const {
    data: { token },
  } = JSON.parse(body) as TokenRequestPayload;

  if (!token) {
    await sendMessageToClient(connectionId, {
      type: 'error',
      data: { message: 'Missing token param' },
    });
    return statusResponse;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthContext;
    console.log('decoded value', decoded);

    await notificationsDb.saveConnection(decoded.uuid, connectionId);

    console.log('connection saved to db');
    await sendMessageToClient(connectionId, {
      type: 'authorized',
      data: decoded,
    });
  } catch (e) {
    console.log('error', e);
    await sendMessageToClient(connectionId, {
      type: 'error',
      data: { message: 'Not authorized' },
    });
  }

  return statusResponse;
};
