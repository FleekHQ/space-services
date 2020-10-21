import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
  Wallet,
  RawWallet,
  StripeInfo,
  RawStripeInfo,
  StripeSubscription,
  RawStripeSubscription,
} from './types';
import base58Keygen from './base58-keygen';
import deriveKey from './key-processor';
import { BaseModel } from '../base';
import { PrimaryKey } from '../types';

import { NotFoundError, ValidationError } from '../errors';

const WALLET_KEY = 'wallet';
const UNOWNED_WALLET_UUID = '0';
const STRIPE_INFO_KEY = 'stripe';
const STRIPE_SUBSCRIPTION_KEY = 'stripe-subscription';

export const getWalletPrimaryKey = (keyHash: string): PrimaryKey => ({
  pk: keyHash,
  sk: WALLET_KEY,
});

export const getStripeInfoPrimaryKey = (email: string): PrimaryKey => ({
  pk: email,
  sk: STRIPE_INFO_KEY,
});

export const getStripeSubscriptionPrimaryKey = (
  subscriptionId: string
): PrimaryKey => ({
  pk: subscriptionId,
  sk: STRIPE_SUBSCRIPTION_KEY,
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

const mapStripeInfoToDbObject = (info: StripeInfo): RawStripeInfo => {
  const { email, ...rest } = info;

  return {
    ...getStripeInfoPrimaryKey(email),
    ...rest,
  };
};

const parseDbObjectToStripeInfo = (raw: RawStripeInfo): StripeInfo => {
  const info = {
    email: raw.pk,
    stripeCustomerId: raw.stripeCustomerId,
    createdAt: raw.createdAt,
  };

  return info;
};

const mapStripeSubscriptionToDbObject = (
  info: StripeSubscription
): RawStripeSubscription => {
  const { id, uuid, ...rest } = info;

  return {
    ...getStripeInfoPrimaryKey(id),
    gs1pk: uuid,
    gs1sk: STRIPE_SUBSCRIPTION_KEY,
    ...rest,
  };
};

const parseDbObjectToStripeSubscription = (
  raw: RawStripeSubscription
): StripeSubscription => {
  const info = {
    id: raw.pk,
    stripeCustomerId: raw.stripeCustomerId,
    createdAt: raw.createdAt,
    uuid: raw.gs1pk,
  };

  return info;
};

export class BillingModel extends BaseModel {
  constructor(
    env: string,
    client: DocumentClient = new DocumentClient({
      region: 'us-west-2',
    })
  ) {
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

  /**
   * Store email, stripeCustomerId and uuid
   */
  public async saveStripeInfo(
    email: string,
    stripeCustomerId: string
  ): Promise<StripeInfo> {
    const createdAt = new Date(Date.now()).toISOString();

    const info = {
      createdAt,
      email,
      stripeCustomerId,
    };

    const dbItem = mapStripeInfoToDbObject(info);

    await this.put(dbItem);

    return info;
  }

  public async getStripeInfoByEmail(email: string): Promise<StripeInfo> {
    const pkey = getStripeInfoPrimaryKey(email);

    const rawInfo = await this.get(pkey).then(
      result => result.Item as RawStripeInfo
    );

    if (!rawInfo) {
      throw new NotFoundError(`Stripe info for e-mail "${email}" not found.`);
    }

    return parseDbObjectToStripeInfo(rawInfo);
  }

  /**
   * Store subscription id, stripeCustomerId, key and uuid
   */
  public async saveStripeSubscription(
    id: string,
    stripeCustomerId: string,
    uuid: string
  ): Promise<StripeSubscription> {
    const createdAt = new Date(Date.now()).toISOString();

    const sub = {
      createdAt,
      id,
      stripeCustomerId,
      uuid,
    };

    const dbItem = mapStripeSubscriptionToDbObject(sub);

    await this.put(dbItem);

    return sub;
  }

  public async getStripeSubscription(id: string): Promise<StripeSubscription> {
    const pkey = getStripeSubscriptionPrimaryKey(id);

    const rawInfo = await this.get(pkey).then(
      result => result.Item as RawStripeSubscription
    );

    if (!rawInfo) {
      throw new NotFoundError(
        `Stripe subscription for customer "${id}" not found.`
      );
    }

    return parseDbObjectToStripeSubscription(rawInfo);
  }

  /**
   * Adding credits to prepaid wallet
   */
  public async addCreditsToWallet(
    walletKey: string,
    credits: number
  ): Promise<Wallet> {
    return this.addCredits(walletKey, credits);
  }

  /**
   * Adding credits to user wallet
   * @param subscriptionId
   * @param credits
   */
  public async addCreditsByStripeSubscription(
    subscriptionId: string,
    credits: number
  ): Promise<Wallet> {
    const subscription = await this.getStripeSubscription(subscriptionId);
    return this.addCredits(subscription.uuid, credits);
  }
}

export default BillingModel;
