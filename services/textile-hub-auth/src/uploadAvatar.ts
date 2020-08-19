import { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda';
import { IdentityModel } from '@packages/models';
import buildIpfsClient from 'ipfs-http-client';
import { AuthContext } from './authorizer';

const STAGE = process.env.ENV;
const identityDb = new IdentityModel(STAGE);

const ipfsClient = buildIpfsClient({
  host: process.env.IPFS_HOST,
  port: '5001',
});

export const handler = async function(
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> {
  const { uuid } = event.requestContext.authorizer;

  try {
    const result = await ipfsClient.add({ content: event.body });
    const avatarUrl = `https://ipfs.fleek.co/ipfs/${result.cid.toString()}`;

    await identityDb.updateIdentity(uuid, { avatarUrl });

    return {
      statusCode: 200,
      body: JSON.stringify({ avatarUrl }),
      isBase64Encoded: false,
    };
  } catch (e) {
    console.log(e);

    return {
      statusCode: 500,
      body: 'Internal server error',
      isBase64Encoded: false,
    };
  }
};
