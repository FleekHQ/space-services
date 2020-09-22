import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Wallet, RawWallet } from './types';
import base58Keygen from './base58-keygen';
import deriveKey from './key-processor';
import { BaseModel } from '../base';
import { PrimaryKey } from '../types';

import { NotFoundError, ValidationError } from '../errors';

const WALLET_KEY = 'wallet';
const UNOWNED_WALLET_UUID = '0';

export const getWalletPrimaryKey = (keyHash: string): PrimaryKey => ({
  pk: keyHash,
  sk: WALLET_KEY,
});

const mapWalletToDbObject = (wallet: Wallet): RawWallet => {
  const { ownerUuid, keyHash, ...rest } = wallet;

  return {
    ...getWalletPrimaryKey(keyHash),
    gs1pk: ownerUuid,
    gs1sk: WALLET_KEY,
    ...rest,
  };
};

const parseDbObjectToWallet = (raw: RawWallet): Wallet => {
  const wallet: Wallet = {
    keyHash: raw.pk,
    ownerUuid: raw.gs1pk,
    credits: raw.credits,
    createdAt: raw.createdAt,
  };

  return wallet;
};

export class BillingModel extends BaseModel {
  constructor(env: string, client: DocumentClient = new DocumentClient()) {
    const table = `space_table_${env}`;
    super(table, client);
  }

  // Creates a wallet, and returns the key that can be derived to obtain the wallet back
  public async createWallet(): Promise<string> {
    const createdAt = new Date(Date.now()).toISOString();
    const key = base58Keygen(16);
    const keyHash = deriveKey(key);

    let existingWallet = null;
    try {
      existingWallet = await this.getWalletByKey(key);
    } catch (error) {
      // Do nothing
    }

    if (existingWallet) {
      // Very unlikely error (1 in 1.64 * 10^28)
      throw new ValidationError('Wallet key collision. Please try again.');
    }

    const newWallet: Wallet = {
      createdAt,
      ownerUuid: UNOWNED_WALLET_UUID,
      keyHash,
      credits: 0,
    };

    const dbItem = mapWalletToDbObject(newWallet);

    await this.put(dbItem);

    return key;
  }

  public async getWalletByKey(key: string): Promise<Wallet> {
    const keyHash = deriveKey(key);
    const rawWallet = await this.get(getWalletPrimaryKey(keyHash)).then(
      result => result.Item as RawWallet
    );

    if (!rawWallet) {
      throw new NotFoundError(`Wallet with key ${key} not found.`);
    }

    return parseDbObjectToWallet(rawWallet);
  }

  public async claimWallet(key: string, ownerUuid: string): Promise<Wallet> {
    const existingWallet = await this.getWalletByKey(key);

    if (existingWallet.ownerUuid !== UNOWNED_WALLET_UUID) {
      throw new ValidationError('Key has already been claimed.');
    }

    const updatedWallet: Wallet = {
      ...existingWallet,
      ownerUuid,
    };

    const dbItem = mapWalletToDbObject(updatedWallet);

    await this.put(dbItem);
    return updatedWallet;
  }

  /**
   * Adds (or subtracts) credits from wallet balance
   *
   * @param key
   * @param credits
   */
  public async addCredits(key: string, credits: number): Promise<Wallet> {
    // check if wallet exists
    const wallet = await this.getWalletByKey(key);

    const Key = getWalletPrimaryKey(wallet.keyHash);

    const ExpressionAttributeValues = {
      ':credits': credits,
      ':zero': 0,
    };

    const ExpressionAttributeNames = {
      '#credits': 'credits',
    };

    const UpdateExpression = `SET #credits = if_not_exists(#credits, :zero) + :credits`;

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

    return parseDbObjectToWallet(res.Attributes as RawWallet);
  }
}

export default BillingModel;
