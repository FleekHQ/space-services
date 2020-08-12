import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { deriveAddressFromPubKey } from '@packages/crypto';
import {
  mapIdentityDbObject,
  mapProofDbObject,
  parseDbObjectToIdentity,
  IDENTITY_KEY,
} from './access-patterns';
import {
  CreateIdentityInput,
  Identity,
  CreateProofInput,
  Proof,
  RawIdentity,
} from './types';
import { validateIdentity } from './validations';
import { BaseModel } from '../base';
import { NotFoundError } from '../errors';

export class IdentityModel extends BaseModel {
  constructor(env: string, client: DocumentClient = new DocumentClient()) {
    const table = `space_table_${env}`;
    super(table, client);
  }

  public async createIdentity(input: CreateIdentityInput): Promise<Identity> {
    const createdAt = new Date(Date.now()).toISOString();
    const address = deriveAddressFromPubKey(input.publicKey);

    const newIdentity: Identity = {
      address,
      createdAt,
      publicKey: input.publicKey,
      username: input.username,
    };

    await validateIdentity(this, newIdentity);

    const dbItem = mapIdentityDbObject(newIdentity);

    await this.put(dbItem);

    return newIdentity;
  }

  public async createProof(input: CreateProofInput): Promise<Proof> {
    const createdAt = new Date(Date.now()).toISOString();

    const newProof: Proof = {
      proofType: input.proofType,
      username: input.username,
      value: input.value,
      createdAt,
    };

    const dbItem = mapProofDbObject(newProof);

    await this.put(dbItem);

    return newProof;
  }

  public async getIdentityByAddress(address: string): Promise<Identity> {
    const rawIdentities = await this.query({
      TableName: this.table,
      IndexName: 'gs1',
      Select: 'ALL_PROJECTED_ATTRIBUTES',
      KeyConditionExpression: 'gs1pk = :identity AND gs1sk = :address',
      ExpressionAttributeValues: {
        ':address': address,
        ':identity': IDENTITY_KEY,
      },
    });

    const identities = (rawIdentities.Items as RawIdentity[]).map(
      parseDbObjectToIdentity
    );

    if (identities.length === 0) {
      throw new NotFoundError(`Identity with address ${address} not found.`);
    }

    return identities[0];
  }

  public getIdentityByPublicKey(publicKey: string): Promise<Identity> {
    const address = deriveAddressFromPubKey(publicKey);
    return this.getIdentityByAddress(address);
  }

  public async getIdentityByUsername(username: string): Promise<Identity> {
    const stubIdentity = mapIdentityDbObject({
      username,
      address: '',
      publicKey: '',
      createdAt: '',
    });

    const rawIdentity = await this.getItem(stubIdentity.pk, stubIdentity.sk);

    if (!rawIdentity.Item || !rawIdentity.Item.pk) {
      throw new NotFoundError(`Identity with username ${username} not found.`);
    }

    return parseDbObjectToIdentity(rawIdentity.Item as RawIdentity);
  }
}

export default IdentityModel;
