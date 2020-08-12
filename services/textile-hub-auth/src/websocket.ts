import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client } from '@textile/hub';
import { SignatureModel, IdentityModel } from '@packages/models';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';

(global as any).WebSocket = require('isomorphic-ws');

const STAGE = process.env.ENV;
const JWT_SECRET = process.env.JWT_SECRET;

const sigDb = new SignatureModel(STAGE);
const identityDb = new IdentityModel(STAGE);

interface InMessage {
  sig?: string;
  pubkey?: string;
}

const createTextileClient = async (): Promise<Client> => {
  const client = await Client.withKeyInfo({
    key: process.env.TXL_USER_KEY,
    secret: process.env.TXL_USER_SECRET,
  });

  return client;
};

const sendMessageToClient = (
  connectionId: string,
  payload: object
): Promise<object> =>
  new Promise((resolve, reject) => {
    const apig = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: process.env.APIG_ENDPOINT,
    });
    apig.postToConnection(
      {
        ConnectionId: connectionId, // connectionId of the receiving ws-client
        Data: JSON.stringify(payload),
      },
      (err, data) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        console.log('Sent data', payload);
        return resolve(data);
      }
    );
  });

const MAX_RETRIES = 6;
const TIME_BETWEEN_RETRIES = 3000;

const waitForChallengeAnswer = async (
  publicKey: string,
  retries = 0
): Promise<string> => {
  let signature;
  try {
    signature = await sigDb.getSignatureByPublicKey(publicKey);
  } catch {
    // signature doesnt exist
  }

  if (signature) {
    await sigDb.deleteSignatureByPublicKey(publicKey);
    return signature.signature;
  }

  if (retries > MAX_RETRIES) {
    throw new Error('Did not receive signature before MAX_RETRIES');
  }

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      waitForChallengeAnswer(publicKey, retries + 1)
        .then(res => resolve(res))
        .catch(err => reject(err));
    }, TIME_BETWEEN_RETRIES);
  });
};

const handleTokenRequest = async (data: InMessage, connectionId: string) => {
  if (!data.pubkey) {
    throw new Error('Missing pubkey param');
  }

  const client = await createTextileClient();

  // Multibase (lib used by textile identities) prepends the public key with a "code"
  // https://github.com/multiformats/js-multibase
  const token = await client.getTokenChallenge(
    data.pubkey,
    (challenge: Uint8Array) => {
      return new Promise((resolve, reject) => {
        const value = Buffer.from(challenge).toJSON();
        const challengePayload = {
          type: 'challenge',
          value,
        };

        // Send message to client and wait for an answer in sync
        sendMessageToClient(connectionId, challengePayload);

        waitForChallengeAnswer(data.pubkey)
          .then(sig => {
            resolve(Buffer.from(sig, 'base64'));
          })
          .catch(() => {
            reject(
              new Error('Did not receive signature in expected timeframe')
            );
          });
      });
    }
  );

  return token;
};

const handleChallenge = async (data: InMessage): Promise<void> => {
  if (!data.sig || !data.pubkey) {
    throw new Error('Missing sig param');
  }

  await sigDb.createSignature(data.pubkey, data.sig);
};

export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const {
    body,
    requestContext: { connectionId, routeKey },
  } = event;
  console.log('Got event: ', event);

  switch (routeKey) {
    case '$connect':
      break;

    case '$disconnect':
      break;

    case 'token':
      {
        const parsedBody = JSON.parse(body);

        try {
          const token = await handleTokenRequest(parsedBody.data, connectionId);
          const { pubkey } = parsedBody.data;
          const user = await identityDb.getIdentityByPublicKey(pubkey);

          const appToken = jwt.sign(
            {
              pubkey,
              username: user && user.username,
            },
            JWT_SECRET,
            { expiresIn: '1d' }
          );

          await sendMessageToClient(connectionId, {
            type: 'token',
            value: { token, appToken },
          });
        } catch (error) {
          console.error(error);
        }
      }
      break;

    case 'challenge':
      {
        const parsedBody = JSON.parse(body);
        try {
          await handleChallenge(parsedBody.data);
        } catch (error) {
          console.error(error);
        }
      }
      break;
    case '$default':
    default:
  }

  // Return a 200 status to tell API Gateway the message was processed
  // successfully.
  // Otherwise, API Gateway will return a 500 to the client.
  return { statusCode: 200, body: '' };
};

export default handler;
