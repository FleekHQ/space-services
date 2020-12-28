import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
import { getAggregatedUsage } from './utils/usage';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

// const STAGE = process.env.ENV;
// const dbModel = createDbModel(STAGE);

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const { pubkey } = event.requestContext.authorizer;

  let storage = 0;
  let bandwidth = 0;

  try {
    const aggregatedUsage = await getAggregatedUsage(pubkey);
    bandwidth = aggregatedUsage.network_egress || 0;
    storage = aggregatedUsage.stored_data || 0;
  } catch (e) {
    console.log('usage error', e);
    // zero usage?
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      storage,
      bandwidth,
    }),
  };
};
