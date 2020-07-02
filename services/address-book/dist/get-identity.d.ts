import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
export declare const getIdentityByUsername: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const getIdentityByAddress: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
