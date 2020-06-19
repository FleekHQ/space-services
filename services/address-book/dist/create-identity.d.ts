import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
export declare const createIdentity: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export default createIdentity;
