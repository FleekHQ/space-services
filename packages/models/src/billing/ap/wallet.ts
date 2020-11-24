import { PrimaryKey } from '../../types';
import DbClient from '../../dbTable';

export interface Wallet {
  address: string;
  currency: string;
  accountId: string;
  createdAt: string;
}

interface RawInfo {
  pk: string;
  sk: string;
  accountId: string;
  createdAt: string;
}

export interface AddWalletInput {
  address: string;
  currency: string;
  accountId: string;
}

export interface WalletApi {
  addWallet: (data: AddWalletInput) => Promise<Wallet>;
  getWallet: (address: string, currency: string) => Promise<Wallet>;
}

const SK_STRING = 'wallet';

const getPrimaryKey = (address: string, currency: string): PrimaryKey => ({
  pk: address,
  sk: `${SK_STRING}#${currency}`,
});

const objectToRaw = (obj: Wallet): RawInfo => {
  const { address, currency, ...rest } = obj;

  return {
    ...getPrimaryKey(address, currency),
    ...rest,
  };
};

const rawToObject = (raw: RawInfo): Wallet => {
  const { pk, sk, ...rest } = raw;

  return {
    address: pk,
    currency: sk.split('#').pop(),
    ...rest,
  };
};

export default (db: DbClient): WalletApi => ({
  getWallet: async (address: string, currency: string): Promise<Wallet> => {
    const raw = await db.getWithError(
      getPrimaryKey(address, currency),
      `Wallet (${currency}) with address "${address}" was not found.`
    );
    return rawToObject(raw as RawInfo);
  },

  addWallet: async (data: AddWalletInput): Promise<Wallet> => {
    const obj = { ...data, createdAt: new Date().toISOString() };

    await db.put(objectToRaw(obj));

    return obj;
  },
});
