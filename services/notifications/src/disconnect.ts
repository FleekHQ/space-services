import { APIGatewayProxyEvent } from 'aws-lambda';
import { createNotificationsModel } from '@packages/models';

const STAGE = process.env.ENV;
const notificationsDb = createNotificationsModel(STAGE);

// eslint-disable-next-line
export const handler = async function(
  event: APIGatewayProxyEvent
): Promise<void> {
  const {
    requestContext: { connectionId },
  } = event;

  try {
    await notificationsDb.deleteConnectionById(connectionId);
  } catch (e) {
    // not auth connection closed
  }
  // remove connection from db
};
