import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SignatureModel } from '@packages/models';

interface ChallengePayload {
  data: {
    sig: string;
    pubkey: string;
  }
}

const STAGE = process.env.ENV;
const sigDb = new SignatureModel(STAGE);

export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {

  const { data } = JSON.parse(event.body) as ChallengePayload;

    if (!data.sig || !data.pubkey) {
      throw new Error('Missing sig param');
    }

    console.log('storing signature to db', data);
    await sigDb.createSignature(data.pubkey, data.sig);

  return { statusCode: 200, body: '' };
};
