import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import dynamodbUpdateExpression from 'dynamodb-update-expression';

class DbTable {
  client!: DocumentClient;

  table: string;

  constructor(
    table: string,
    client: DocumentClient = new DocumentClient({ region: 'us-west-2' })
  ) {
    this.table = table;
    this.client = client;
  }

  put(
    data: DocumentClient.PutItemInputAttributeMap
  ): Promise<DocumentClient.PutItemOutput> {
    const params: DocumentClient.PutItemInput = {
      TableName: this.table,
      Item: data,
    };
    return this.client.put(params).promise();
  }

  // another get with different arguments for convenience
  // Keys are handled as pk and sk
  getItem(
    partitionKey: string,
    sortKey: string
  ): Promise<DocumentClient.GetItemOutput> {
    const params = {
      TableName: this.table,
      Key: {
        pk: partitionKey,
        sk: sortKey,
      },
    };
    return this.client.get(params).promise();
  }

  // another update for convenience
  async updateItem(
    partitionKey: string,
    sortKey: string,
    updateData: any,
    originalItem?: DocumentClient.GetItemOutput
  ): Promise<DocumentClient.UpdateItemOutput> {
    let original: DocumentClient.GetItemOutput;
    if (originalItem) {
      original = originalItem;
    } else {
      original = await this.getItem(partitionKey, sortKey);
    }

    const updateExpression = dynamodbUpdateExpression.getUpdateExpression(
      original,
      updateData
    );

    const params = {
      TableName: this.table,
      Key: {
        pk: partitionKey,
        sk: sortKey,
      },
      ReturnValues: 'ALL_NEW',
      ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
      ...updateExpression,
    };

    if (params.UpdateExpression === '') {
      return Promise.resolve({});
    }

    return new Promise((resolve, reject) => {
      return this.client
        .update(params)
        .promise()
        .then(result => {
          if (result.Attributes.data) {
            resolve(result.Attributes.data);
          } else {
            resolve(result.Attributes);
          }
        })
        .catch(reject);
    });
  }

  // another put for convenience
  putItem(
    partitionKey: string,
    sortKey: string,
    data: any
  ): Promise<DocumentClient.PutItemOutput> {
    // NOTE: ConditionExpression avoids adding with put an item with duplicate keys
    const params = {
      TableName: this.table,
      Item: {
        pk: partitionKey,
        sk: sortKey,
        data,
      },
      ConditionExpression:
        'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    };

    return this.client.put(params).promise();
  }

  // convencience method to upsert and get back updated item
  // Idea taken from http://www.jramoyo.com/2017/03/upserting-items-into-dynamodb.html
  async upsertItem(
    partitionKey: string,
    sortKey: string,
    data: any
  ): Promise<DocumentClient.GetItemOutput> {
    // 1. get existing item
    const existingItem = await this.getItem(partitionKey, sortKey);
    if (Object.keys(existingItem).length > 0) {
      // 2. update item if it already exists
      await this.updateItem(partitionKey, sortKey, data, existingItem);
    } else {
      // 3. Otherwise, put/insert the item
      try {
        await this.putItem(partitionKey, sortKey, data);
      } catch (err) {
        if (err.code === 'ConditionalCheckFailedException') {
          console.log(
            `upsert ConditionalCheckFailedException pk: ${partitionKey} sk: ${sortKey}`
          );
          // 3a. Only 1 of the concurrent puts will succeed,
          // the rest should retry recursively
          // NOTE: @doug this code is only for race conditions in case
          // multiples put with same keys happen which is unlikely
          // leaving it commented
          // return this.upsertItem(partitionKey, sortKey, data);
        }
        throw err;
      }
    }
    // call item again after update
    return this.getItem(partitionKey, sortKey);
  }

  get(data: DocumentClient.Key): Promise<DocumentClient.GetItemOutput> {
    const params = {
      TableName: this.table,
      Key: data,
    };
    return this.client.get(params).promise();
  }

  query(data: DocumentClient.QueryInput): Promise<DocumentClient.QueryOutput> {
    return this.client.query(data).promise();
  }

  update(
    data: DocumentClient.UpdateItemInput
  ): Promise<DocumentClient.UpdateItemOutput> {
    return this.client.update(data).promise();
  }

  delete(data: DocumentClient.Key): Promise<DocumentClient.DeleteItemOutput> {
    const params = {
      TableName: this.table,
      Key: data,
    };

    return this.client.delete(params).promise();
  }

  /**
   * Writing and reading in batches
   * https://docs.amazonaws.cn/en_us/sdk-for-javascript/v2/developer-guide/dynamodb-example-table-read-write-batch.html
   * @param requests
   */

  batchWrite(
    requests: DocumentClient.WriteRequests
  ): Promise<DocumentClient.BatchWriteItemOutput> {
    const params = {
      RequestItems: {
        [this.table]: requests,
      },
    };
    return this.client.batchWrite(params).promise();
  }

  batchGet(
    requests: DocumentClient.KeysAndAttributes
  ): Promise<DocumentClient.BatchGetItemOutput> {
    const params = {
      RequestItems: {
        [this.table]: requests,
      },
    };
    return this.client.batchGet(params).promise();
  }

  async getWithError(
    data: DocumentClient.Key,
    notFoundMessage?: string
  ): Promise<DocumentClient.AttributeMap> {
    const result = await this.get(data);

    if (!result || !result.Item) {
      throw new Error(notFoundMessage || 'Record was not found.');
    }

    return result.Item;
  }
}

export default DbTable;
