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

  const buffer = Buffer.from(event.body, 'base64');

  try {
    const result = await ipfsClient.add({ content: buffer });
    const avatarUrl = `https://ipfs.fleek.co/ipfs/${result.cid.toString()}`;

    const data = await identityDb.updateIdentity(uuid, { avatarUrl });

    return {
      statusCode: 201,
      body: JSON.stringify({ data }),
    };
  } catch (e) {
    console.log(e);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
