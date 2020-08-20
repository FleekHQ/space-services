import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client } from '@textile/hub';
import { SignatureModel, IdentityModel, NotFoundError } from '@packages/models';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import { defer } from 'rxjs';
import { retryWhen, delay, take, switchMap } from 'rxjs/operators';
import multibase from 'multibase';
import { AuthContext } from '../authorizer';

(global as any).WebSocket = require('isomorphic-ws');

interface TokenRequestPayload {
  data: {
    pubkey: string;
  };
}

const STAGE = process.env.ENV;
const JWT_SECRET = process.env.JWT_SECRET;

const sigDb = new SignatureModel(STAGE);
const identityDb = new IdentityModel(STAGE);
const apig = new AWS.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: process.env.APIG_ENDPOINT,
});

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
  apig
    .postToConnection({
      ConnectionId: connectionId, // connectionId of the receiving ws-client
      Data: JSON.stringify(payload),
    })
    .promise();

const findChallengeAnswer = (pubkey: string): Promise<Buffer> => {
  const source = defer(() => sigDb.getSignatureByPublicKey(pubkey));

  return source
    .pipe(
      switchMap(async row => {
        try {
          await sigDb.deleteSignatureByPublicKey(row.publicKey);
        } catch (e) {
          console.log('error on row removal');
          console.log(e);
        }

        return Buffer.from(row.signature, 'base64');
      }),
      retryWhen(errors => errors.pipe(delay(1000), take(15)))
    )
    .toPromise();
};

export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const {
    data: { pubkey },
  } = JSON.parse(body) as TokenRequestPayload;

  if (!pubkey) {
    console.log('missing pubkey param');
    throw new Error('Missing pubkey param');
  }

  const client = await createTextileClient();

  console.log('starting get token challenge', { pubkey });

  // Multibase (lib used by textile identities) prepends the public key with a "code"
  // https://github.com/multiformats/js-multibase
  const token = await client.getTokenChallenge(
    pubkey,
    async (challenge: Uint8Array) => {
      const value = Buffer.from(challenge).toJSON();
      const challengePayload = {
        type: 'challenge',
        value,
      };

      console.log({ challenge });
      console.log('Sending challenge to client', challengePayload);
      // Send message to client and wait for an answer in sync
      await sendMessageToClient(connectionId, challengePayload);

      console.log('Waiting for client to answer');

      const answer = await findChallengeAnswer(pubkey);
      console.log({ answer });

      return answer;
    }
  );

  const hexPubKey = multibase
    .decode(pubkey)
    .toString('hex')
    .substr(-64);

  const user = await identityDb.getIdentityByPublicKey(hexPubKey).catch(e => {
    if (e instanceof NotFoundError) {
      return identityDb.createIdentity({
        publicKey: hexPubKey,
      });
    }

    throw e;
  });

  const authPayload: AuthContext = {
    pubkey: hexPubKey,
    uuid: user.uuid,
  };

  const appToken = jwt.sign(authPayload, JWT_SECRET, {
    expiresIn: '1d',
  });

  await sendMessageToClient(connectionId, {
    type: 'token',
    value: { token, appToken },
  });

  return { statusCode: 200, body: '' };
};
