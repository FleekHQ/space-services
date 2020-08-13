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
import { NotFoundError } from '../errors';

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
    await this.put(mapUsernameDbObject(newIdentity));

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
      throw new NotFoundError(`Identity with address not found.`);
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
}

export default IdentityModel;
