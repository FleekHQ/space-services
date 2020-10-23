import DbTable from '../dbTable';

type Connection = {
  pk: string;
  sk: string;
  connectionId: string;
  establishedAt: string;
  gs1pk: string;
  gs1sk: string;
};

interface ModelApi {
  getConnectionByUuid: (uuid: string) => Promise<Connection>;
  saveConnection: (uuid: string, connectionId: string) => Promise<Connection>;
  deleteConnectionById: (connectionId: string) => Promise<void>;
}

const SORT_KEY = 'wss';

export default (env: string): ModelApi => {
  const db = new DbTable(`space_table_${env}`);

  return {
    getConnectionByUuid: async (uuid: string): Promise<Connection> => {
      const KeyConditionExpression = 'gs1pk = :id AND begins_with(gs1sk, :sk)';
      const ExpressionAttributeValues = {
        ':id': uuid,
        ':sk': SORT_KEY,
      };

      const params = {
        TableName: db.table,
        Select: 'ALL_PROJECTED_ATTRIBUTES',
        KeyConditionExpression,
        ExpressionAttributeValues,
        IndexName: 'gs1',
        ScanIndexForward: false,
      };

      const output = await db.query(params);

      if (!output.Items.length) {
        throw new Error(
          `Websocket Connection for user "${uuid}" was not found.`
        );
      }

      const lastConnection = output.Items.shift() as Connection;

      return lastConnection;
    },

    saveConnection: async (
      uuid: string,
      connectionId: string
    ): Promise<Connection> => {
      const establishedAt = new Date().toISOString();

      const rawInfo = {
        pk: connectionId,
        sk: SORT_KEY,
        gs1pk: uuid,
        gs1sk: `${SORT_KEY}#${establishedAt}`,
        connectionId,
        establishedAt,
      };
      await db.put(rawInfo);

      return rawInfo;
    },

    deleteConnectionById: async (connectionId: string): Promise<void> => {
      await db.delete({
        pk: connectionId,
        sk: SORT_KEY,
      });
    },
  };
};
