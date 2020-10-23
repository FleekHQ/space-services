import { PrimaryKey } from '../../types';
import DbClient from '../../dbTable';
import { AccountPlan } from './account';

export interface StripeSubscription {
  id: string;
  accountId: string;
  billingAccountId: string;
  stripeCustomerId: string;
  createdAt: string;
  priceId: string;
  plan: AccountPlan;
}

export interface StripeSubscriptionInput {
  id: string;
  stripeCustomerId: string;
  billingAccountId: string;
  accountId: string;
  priceId: string;
  plan?: AccountPlan;
}

interface RawInfo {
  pk: string;
  sk: string;
  gs1pk: string;
  gs1sk: string;
  stripeCustomerId: string;
  billingAccountId: string;
  createdAt: string;
  priceId: string;
  plan: AccountPlan;
}

interface StripeCustomerApi {
  getStripeSubscription: (
    subscriptionId: string
  ) => Promise<StripeSubscription>;
  createStripeSubscription: (
    input: StripeSubscriptionInput
  ) => Promise<StripeSubscription>;
}

const SK_STRING = 'stripe-subscription';

const getPrimaryKey = (id: string): PrimaryKey => ({
  pk: id,
  sk: SK_STRING,
});

const objectToRaw = (obj: StripeSubscription): RawInfo => {
  const { id, ...rest } = obj;

  return {
    ...getPrimaryKey(id),
    ...rest,
    gs1pk: obj.accountId,
    gs1sk: SK_STRING,
  };
};

const rawToObject = (raw: RawInfo): StripeSubscription => {
  const { pk, sk, gs1pk, gs1sk, ...rest } = raw;

  return {
    id: pk,
    accountId: gs1pk,
    ...rest,
  };
};

export default (db: DbClient): StripeCustomerApi => ({
  getStripeSubscription: async (id: string): Promise<StripeSubscription> => {
    const raw = await db.getWithError(
      getPrimaryKey(id),
      `Stripe subscription #${id} was not found.`
    );
    return rawToObject(raw as RawInfo);
  },

  createStripeSubscription: async (
    data: StripeSubscriptionInput
  ): Promise<StripeSubscription> => {
    const putObj = {
      plan: AccountPlan.PRO,
      ...data,
      createdAt: new Date().toISOString(),
    };

    await db.put(objectToRaw(putObj));

    return putObj;
  },
});
