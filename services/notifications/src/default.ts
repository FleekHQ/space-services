import { APIGatewayProxyResult } from 'aws-lambda';

// eslint-disable-next-line
export const handler = async function(): Promise<APIGatewayProxyResult> {
  return { statusCode: 200, body: '' };
};
