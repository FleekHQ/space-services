import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import CID from 'cids';

import AWS from 'aws-sdk';
import { AuthContext } from './authorizer';

require('cross-fetch/polyfill');

AWS.config.update({
  region: 'us-west-2',
});

const kinesis = new AWS.Kinesis({
  apiVersion: '2013-12-02',
});

const STAGE = process.env.ENV;

const streamName = `filecoin-archive-${STAGE}`;

const formatIpfsHash = (cid: string): string => {
  const cidObj = new CID(cid);
  return cidObj.toV1().toString();
};

// eslint-disable-next-line
export const handler = middy(async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { hash, publicKey, size } = JSON.parse(event.body);

  try {
    const payload = {
      e: {
        size,
        hash: formatIpfsHash(hash),
        spacePublicKey: publicKey,
        requestedAt: Date.now(),
      },
    };

    const params = {
      Data: JSON.stringify(payload),
      StreamName: streamName,
      PartitionKey: payload.e.hash.substr(-6),
    };
    kinesis.putRecord(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        throw err;
      }
      // an error occurred
      else console.log(data); // successful response
    });
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Unable to stage for archiving: ${e.toString()}`,
      }),
    };
  }

  const response = {
    statusCode: 201,
    body: 'Success',
  };

  return response;
}).use(cors());
