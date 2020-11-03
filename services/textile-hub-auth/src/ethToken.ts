import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SignatureModel, IdentityModel } from '@packages/models';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import { defer } from 'rxjs';
import { retryWhen, delay, take, switchMap } from 'rxjs/operators';
import EthCrypto from 'eth-crypto';
import crypto from 'crypto';

(global as any).WebSocket = require('isomorphic-ws');

interface TokenRequestPayload {
  data: {
    pubkey: string;
  };
}

interface AuthContext {
  uuid: string;
  pubkey: string;
  address?: string;
}

const STAGE = process.env.ENV;
const { JWT_SECRET } = process.env;

const sigDb = new SignatureModel(STAGE);
const identityDb = new IdentityModel(STAGE);

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

const findChallengeAnswer = (pubkey: string): Promise<string> => {
  const source = defer(() => sigDb.getSignatureByPublicKey(pubkey));

  return source
    .pipe(
      switchMap(async row => {
        await sigDb.deleteSignatureByPublicKey(row.publicKey);
        return row.signature;
      }),
      retryWhen(errors => errors.pipe(delay(1000), take(15)))
    )
    .toPromise();
};

const okStatus = { statusCode: 200, body: '' };

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<void | APIGatewayProxyResult> {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const {
    data: { pubkey },
  } = JSON.parse(body) as TokenRequestPayload;

  if (!pubkey) {
    throw new Error('Missing pubkey param');
  }

  const challenge = crypto.randomBytes(64).toString('hex');

  const challengeEncrypted = await EthCrypto.encryptWithPublicKey(
    pubkey,
    challenge
  );

  const challengePayload = {
    type: 'challenge',
    value: EthCrypto.cipher.stringify(challengeEncrypted),
  };

  // Send message to client and wait for an answer in sync
  await sendMessageToClient(connectionId, challengePayload);

  const answer = await findChallengeAnswer(pubkey);

  if (answer !== challenge) {
    console.log('answer does not match challenge', {
      answer,
      challenge,
    });
    return okStatus;
  }

  const address = EthCrypto.publicKey.toAddress(pubkey);

  const user = await identityDb.getIdentityByAddress(address);

  const authPayload: AuthContext = {
    pubkey,
    uuid: user.uuid,
    address,
  };

  const appToken = jwt.sign(authPayload, JWT_SECRET, {
    expiresIn: '30d',
  });

  const payload = {
    appToken,
    address,
  };

  await sendMessageToClient(connectionId, {
    type: 'ethToken',
    value: payload,
  });

  return okStatus;
};
