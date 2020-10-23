import { PrimaryKey } from '../../types';
import DbClient from '../../dbTable';
import { getUpdateExpressions } from '../../utils';

export type AccountType = 'personal' | 'team';

export enum AccountPlan {
  BASIC = 'basic',
  PRO = 'pro',
}

export enum BillingMode {
  CREDITS = 'credits',
  STRIPE = 'stripe',
}

export interface Account {
  id: string;
  credits: number;
  billingAccountId: string;
  createdAt: string;
  type: AccountType;
  plan: AccountPlan;
  // in case of downgrading, this plan will be activated after
  // current billing period ends
  nextPlan?: AccountPlan;
  estimatedCost?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  stripeSubscriptionId?: string;
  billingMode?: BillingMode;
}

interface RawInfo {
  pk: string;
  sk: string;
  credits: number;
  createdAt: string;
  billingAccountId: string;
  type: AccountType;
  plan: AccountPlan;
  nextPlan?: AccountPlan;
  estimatedCost?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  stripeSubscriptionId?: string;
  billingMode?: BillingMode;
}

interface CreateAccountInput {
  id: string;
  billingAccountId: string;
  type: AccountType;
}

export interface UpdateAccountInput {
  plan?: AccountPlan;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  estimatedCost?: number;
  stripeSubscriptionId?: string;
  billingMode?: BillingMode;
}

interface AccountApi {
  getAccount: (uuid: string) => Promise<Account>;
  createAccount: (input: CreateAccountInput) => Promise<Account>;
  updateAccount: (uuid: string, data: UpdateAccountInput) => Promise<Account>;
}

const SK_STRING = 'account';

const getPrimaryKey = (uuid: string): PrimaryKey => ({
  pk: uuid,
  sk: SK_STRING,
});

const objectToRaw = (obj: Account): RawInfo => {
  const { id, ...rest } = obj;

  return {
    ...getPrimaryKey(id),
    ...rest,
  };
};

const rawToObject = (raw: RawInfo): Account => {
  const { pk, sk, ...rest } = raw;

  return {
    id: pk,
    ...rest,
  };
};

export default (db: DbClient): AccountApi => ({
  getAccount: async (uuid: string): Promise<Account> => {
    const raw = await db.getWithError(
      getPrimaryKey(uuid),
      `Account #${uuid} was not found.`
    );
    return rawToObject(raw as RawInfo);
  },

  createAccount: async (input: CreateAccountInput): Promise<Account> => {
    const obj = {
      credits: 0,
      plan: AccountPlan.BASIC,
      ...input,
      createdAt: new Date().toISOString(),
    };

    await db.put(objectToRaw(obj));

    return obj;
  },

  updateAccount: async (
    accountId: string,
    data: UpdateAccountInput
  ): Promise<Account> => {
    const Key = getPrimaryKey(accountId);
    const params = {
      TableName: db.table,
      Select: 'ALL_PROJECTED_ATTRIBUTES',
      Key,
      ...getUpdateExpressions(data, [
        'plan',
        'billingPeriodStart',
        'billingPeriodEnd',
        'estimatedCost',
        'stripeSubscriptionId',
        'billingMode',
      ]),
      ReturnValues: 'ALL_NEW',
    };

    const res = await db.update(params);

    return rawToObject(res.Attributes as RawInfo);
  },
});
