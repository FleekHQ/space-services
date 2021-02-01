import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { deriveAddressFromPubKey } from '@packages/crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  mapIdentityDbObject,
  mapProofDbObject,
  mapEmailDbObject,
  parseDbObjectToIdentity,
  mapUsernameDbObject,
  mapAddressDbObject,
  getAddressPrimaryKey,
  parseDbObjectToAddress,
  getIdentityPrimaryKey,
  getUsernamePrimaryKey,
  parseDbObjectToUsername,
  getEmailPrimaryKey,
} from './access-patterns';
import {
  CreateIdentityInput,
  IdentityRecord,
  CreateProofInput,
  ProofRecord,
  RawIdentityRecord,
  RawAddressRecord,
  AddressRecord,
  EmailRecord,
  GetIdentitiesQuery,
  GetIdentityQueryType,
} from './types';
import { validateIdentity } from './validations';
import { BaseModel } from '../base';
import { NotFoundError, ValidationError } from '../errors';

const allowedIdentityKeys = ['displayName', 'avatarUrl', 'username', 'email'];

interface AddEthAddressPayload {
  address: string;
  provider?: string;
  metadata?: any;
}

export class IdentityModel extends BaseModel {
  constructor(env: string, client: DocumentClient = new DocumentClient()) {
    const table = `space_table_${env}`;
    super(table, client);
  }

  public async createIdentity(
    input: CreateIdentityInput
  ): Promise<IdentityRecord> {
    const createdAt = new Date(Date.now()).toISOString();
    const address = deriveAddressFromPubKey(input.publicKey);

    const newIdentity = {
      uuid: uuidv4(),
      address,
      createdAt,
      publicKey: input.publicKey,
      username: input.username,
    };

    await validateIdentity(this, newIdentity);

    const dbItem = mapIdentityDbObject(newIdentity);

    // reserve username for this identity
    if (newIdentity.username) {
      await this.put(mapUsernameDbObject(newIdentity));
    }
    // reserve address for this identity
    await this.put(
      mapAddressDbObject({
        ...newIdentity,
      })
    );

    // create identity
    await this.put(dbItem);

    return newIdentity;
  }

  public async createProof(input: CreateProofInput): Promise<ProofRecord> {
    const createdAt = new Date(Date.now()).toISOString();

    const newProof = {
      type: input.type,
      uuid: input.uuid,
      value: input.value,
      createdAt,
    };

    const dbItem = mapProofDbObject(newProof);

    await this.put(dbItem);

    return newProof;
  }

  public async getIdentitiesByDisplayName(
    dn: string
  ): Promise<IdentityRecord[]> {
    const KeyConditionExpression: DocumentClient.KeyExpression =
      'pk = :displayName';
    const ExpressionAttributeValues: DocumentClient.ExpressionAttributeValueMap = {
      ':displayName': `${dn}`,
    };

    const params = {
      TableName: this.table,
      KeyConditionExpression,
      ExpressionAttributeValues,
      IndexName: 'displayName-index',
    };

    const result = await this.query(params);

    return result.Items.map(parseDbObjectToIdentity);
  }

  public async getIdentityByUuid(uuid: string): Promise<IdentityRecord> {
    const rawIdentity = await this.get(getIdentityPrimaryKey(uuid)).then(
      result => result.Item as RawIdentityRecord
    );

    if (!rawIdentity) {
      throw new NotFoundError(`Identity was not found.`);
    }

    return parseDbObjectToIdentity(rawIdentity);
  }

  public async deleteIdentityByUuid(uuid: string): Promise<void> {
    const identity = await this.getIdentityByUuid(uuid);

    // delete username record, catch error if there is no username reserved
    await this.delete(getUsernamePrimaryKey(identity.username)).catch(
      () => null
    );
    // delete address record
    await this.delete(getAddressPrimaryKey(identity.address));
    // delete identity
    // await this.delete(getIdentityPrimaryKey(identity.uuid));
  }

  public async getIdentityByAddress(address: string): Promise<IdentityRecord> {
    const rawAddress = await this.get(getAddressPrimaryKey(address)).then(
      result => result.Item as RawAddressRecord
    );

    if (!rawAddress) {
      throw new NotFoundError(`Identity with address ${address} not found.`);
    }

    const record = parseDbObjectToAddress(rawAddress);
    return this.getIdentityByUuid(record.uuid);
  }

  public getIdentityByPublicKey(publicKey: string): Promise<IdentityRecord> {
    const address = deriveAddressFromPubKey(publicKey);
    return this.getIdentityByAddress(address);
  }

  public async getIdentityByUsername(
    username: string
  ): Promise<IdentityRecord> {
    const rawUsername = await this.get(getUsernamePrimaryKey(username)).then(
      result => result.Item as RawAddressRecord
    );

    if (!rawUsername) {
      throw new NotFoundError(`Identity with username ${username} not found.`);
    }

    const record = parseDbObjectToUsername(rawUsername);
    return this.getIdentityByUuid(record.uuid);
  }

  public async getIdentityByEmail(email: string): Promise<IdentityRecord> {
    const { uuid } = await this.get(getEmailPrimaryKey(email)).then(
      result => result.Item as EmailRecord
    );

    return this.getIdentityByUuid(uuid);
  }

  public async updateIdentity(
    uuid: string,
    payload: Record<string, any>
  ): Promise<IdentityRecord> {
    let id: IdentityRecord;
    // if email is present and already exists, throw an error
    try {
      id = await this.getIdentityByEmail(payload.email);
    } catch (err) {
      throw new Error(`Unable to fetch by email: ${err.message}`);
    }

    if (id) {
      throw new Error('Email already used');
    }

    // check that identity exists
    await this.getIdentityByUuid(uuid);

    // update uuid with new username
    const Key = getIdentityPrimaryKey(uuid);

    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = {};

    const updates = [];

    Object.keys(payload).forEach(key => {
      if (allowedIdentityKeys.includes(key)) {
        ExpressionAttributeValues[`:${key}`] = payload[key];
        ExpressionAttributeNames[`#${key}`] = key;
        updates.push(`#${key} = :${key}`);
      }
    });

    if (!updates.length) {
      throw new Error('Invalid payload.');
    }

    if (payload.username) {
      await this.changeUsername(uuid, payload.username);
    }

    const UpdateExpression = `SET ${updates.join(',')}`;

    const params = {
      TableName: this.table,
      Select: 'ALL_PROJECTED_ATTRIBUTES',
      Key,
      ExpressionAttributeValues,
      ExpressionAttributeNames,
      UpdateExpression,
      ReturnValues: 'ALL_NEW',
    };

    const res = await this.update(params);

    return parseDbObjectToIdentity(res.Attributes as RawIdentityRecord);
  }

  /**
   * Store address relation to uuid
   * @param uuid
   * @param address
   */
  public async addEthAddress(
    uuid: string,
    payload: AddEthAddressPayload
  ): Promise<AddressRecord> {
    const { address, provider, metadata } = payload;

    // prevent adding same address multiple times
    const exists = await this.getIdentityByAddress(address)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      throw new Error('Address is already in use.');
    }

    const obj = {
      uuid,
      address,
      provider,
      metadata,
      createdAt: new Date().toISOString(),
    };

    const rawObj = mapAddressDbObject(obj);

    await this.put(rawObj);

    return obj;
  }

  public async getAddressesByUuid(uuid: string): Promise<AddressRecord[]> {
    const KeyConditionExpression: DocumentClient.KeyExpression =
      'gs1pk = :uuid AND begins_with(gs1sk, :sk)';
    const ExpressionAttributeValues: DocumentClient.ExpressionAttributeValueMap = {
      ':uuid': `${uuid}`,
      ':sk': 'address',
    };

    const params = {
      TableName: this.table,
      KeyConditionExpression,
      ExpressionAttributeValues,
      IndexName: 'gs1',
    };

    const result = await this.query(params);

    return result.Items.map(parseDbObjectToAddress);
  }

  private async changeUsername(uuid: string, username: string): Promise<void> {
    const usernameExists = await this.getIdentityByUsername(username).catch(
      () => false
    );

    if (usernameExists) {
      throw new ValidationError('Username is already taken.');
    }

    const identity = await this.getIdentityByUuid(uuid);

    // assign new username to uuid
    await this.put(
      mapUsernameDbObject({
        uuid,
        username,
        createdAt: new Date().toISOString(),
      })
    );

    // release old username
    await this.delete(getUsernamePrimaryKey(identity.username));
  }

  public async storeEmail(
    uuid: string,
    email: string,
    verified?: boolean
  ): Promise<EmailRecord> {
    const obj = {
      uuid,
      email,
      createdAt: new Date().toISOString(),
      verfiedAt: verified ? new Date().toISOString() : null,
    };

    await this.put(mapEmailDbObject(obj));

    return obj;
  }

  public async getIdentities(
    query: GetIdentitiesQuery[]
  ): Promise<IdentityRecord[]> {
    let ps: Promise<IdentityRecord>[];
    let dpp: Promise<IdentityRecord[]>[];

    query.forEach(q => {
      if (q.type === GetIdentityQueryType.username) {
        ps.push(this.getIdentityByUsername(q.value));
      }
      if (q.type === GetIdentityQueryType.email) {
        ps.push(this.getIdentityByEmail(q.value));
      }
      if (q.type === GetIdentityQueryType.displayName) {
        dpp.push(this.getIdentitiesByDisplayName(q.value));
      }

      throw new Error('Incompatible query type');
    });

    const results = await Promise.all(ps);
    const dpResults = await Promise.all(dpp);

    if (dpResults.length > 0) {
      dpResults.forEach(a => {
        results.concat(a);
      });
    }

    return results;
  }
}

export default IdentityModel;
