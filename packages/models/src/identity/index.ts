import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { deriveAddressFromPubKey } from '@packages/crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  mapIdentityDbObject,
  mapProofDbObject,
  parseDbObjectToIdentity,
  mapUsernameDbObject,
  mapAddressDbObject,
  getAddressPrimaryKey,
  parseDbObjectToAddress,
  getIdentityPrimaryKey,
  getUsernamePrimaryKey,
  parseDbObjectToUsername,
} from './access-patterns';
import {
  CreateIdentityInput,
  IdentityRecord,
  CreateProofInput,
  ProofRecord,
  RawIdentityRecord,
  RawAddressRecord,
} from './types';
import { validateIdentity } from './validations';
import { BaseModel } from '../base';
import { NotFoundError, ValidationError } from '../errors';

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
    await this.put(mapAddressDbObject(newIdentity));

    // create identity
    await this.put(dbItem);

    return newIdentity;
  }

  public async createProof(input: CreateProofInput): Promise<ProofRecord> {
    const createdAt = new Date(Date.now()).toISOString();

    const newProof = {
      proofType: input.proofType,
      uuid: input.uuid,
      value: input.value,
      createdAt,
    };

    const dbItem = mapProofDbObject(newProof);

    await this.put(dbItem);

    return newProof;
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

  public async updateIdentity(uuid: string, payload: Record<string, any>) {
    // check that identity exists
    await this.getIdentityByUuid(uuid);

    const allowedKeys = ['displayName', 'avatarUrl'];

    // update uuid with new username
    const Key = getIdentityPrimaryKey(uuid);

    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = {};

    const updates = [];

    Object.keys(payload).forEach(key => {
      if (allowedKeys.indexOf(key) >= 0) {
        ExpressionAttributeValues[`:${key}`] = payload[key];
        ExpressionAttributeNames[`#${key}`] = key;
        updates.push(`#${key} = :${key}`);
      }
    });

    if (!updates.length) {
      throw new Error('Invalid payload.');
    }

    const UpdateExpression = `SET ${updates.join(',')}`;

    const params = {
      TableName: this.table,
      Select: 'ALL_PROJECTED_ATTRIBUTES',
      Key,
      ExpressionAttributeValues,
      ExpressionAttributeNames,
      UpdateExpression,
    };

    await this.update(params);
  }

  public async changeUsername(uuid: string, username: string) {
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

    // update uuid with new username
    const Key = getIdentityPrimaryKey(uuid);

    const ExpressionAttributeValues = {
      ':username': username,
    };
    const ExpressionAttributeNames = {
      '#username': 'username',
    };
    const UpdateExpression = 'SET #username = :username';

    const params = {
      TableName: this.table,
      Select: 'ALL_PROJECTED_ATTRIBUTES',
      Key,
      ExpressionAttributeValues,
      ExpressionAttributeNames,
      UpdateExpression,
    };

    await this.update(params);

    // release old username
    await this.delete(getUsernamePrimaryKey(identity.username));
  }
}

export default IdentityModel;
