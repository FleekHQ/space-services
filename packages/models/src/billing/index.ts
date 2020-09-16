import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Wallet, RawWallet } from './types';
import base58Keygen from './base58-keygen';
import { BaseModel } from '../base';
import { PrimaryKey } from '../types';

import { NotFoundError, ValidationError } from '../errors';

const WALLET_KEY = 'wallet';

export const getWalletPrimaryKey = (key: string): PrimaryKey => ({
  pk: key,
  sk: WALLET_KEY,
});

const mapWalletToDbObject = (wallet: Wallet): RawWallet => {
  const { ownerUuid, key, ...rest } = wallet;

  return {
    ...getWalletPrimaryKey(key),
    gs1pk: ownerUuid,
    gs1sk: WALLET_KEY,
    ...rest,
  };
};

const parseDbObjectToWallet = (raw: RawWallet): Wallet => {
  const wallet: Wallet = {
    key: raw.pk,
    ownerUuid: raw.gs1pk,
    credits: raw.credits,
    createdAt: raw.createdAt,
  };

  return wallet;
};

export class WalletModel extends BaseModel {
  constructor(env: string, client: DocumentClient = new DocumentClient()) {
    const table = `space_table_${env}`;
    super(table, client);
  }

  public async createWallet(): Promise<Wallet> {
    const createdAt = new Date(Date.now()).toISOString();
    const key = base58Keygen(16);

    let existingWallet = null;
    try {
      existingWallet = this.getWalletByKey(key);
    } catch (error) {
      // Do nothing
    }

    if (existingWallet != null) {
      // Very unlikely error (1 in 1.64 * 10^28)
      throw new ValidationError('Wallet key collision. Please try again.');
    }

    const newWallet: Wallet = {
      createdAt,
      ownerUuid: '',
      key,
      credits: 0,
    };

    const dbItem = mapWalletToDbObject(newWallet);

    await this.put(dbItem);

    return newWallet;
  }

  public async getWalletByKey(key: string): Promise<Wallet> {
    const rawWallet = await this.get(getWalletPrimaryKey(key)).then(
      result => result.Item as RawWallet
    );

    if (!rawWallet) {
      throw new NotFoundError(`Wallet with key ${key} not found.`);
    }

    return parseDbObjectToWallet(rawWallet);
  }
}

export default WalletModel;
