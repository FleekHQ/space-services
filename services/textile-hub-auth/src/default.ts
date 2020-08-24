import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  return { statusCode: 200, body: '' };
};
