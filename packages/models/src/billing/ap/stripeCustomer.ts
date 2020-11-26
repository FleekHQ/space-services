import { PrimaryKey } from '../../types';
import DbClient from '../../dbTable';

export interface StripeCustomer {
  email: string;
  stripeCustomerId: string;
  uuid: string;
  createdAt: string;
}

export interface StripeCustomerInput {
  email: string;
  stripeCustomerId: string;
  uuid: string;
}

interface RawInfo {
  pk: string;
  sk: string;
  stripeCustomerId: string;
  uuid: string;
  createdAt: string;
}

interface StripeCustomerApi {
  getStripeCustomer: (email: string) => Promise<StripeCustomer>;
  saveStripeCustomer: (input: StripeCustomerInput) => Promise<StripeCustomer>;
}

const SK_STRING = 'stripe-customer';

const getPrimaryKey = (email: string): PrimaryKey => ({
  pk: email,
  sk: SK_STRING,
});

const objectToRaw = (obj: StripeCustomer): RawInfo => {
  const { email, ...rest } = obj;

  return {
    ...getPrimaryKey(email),
    ...rest,
  };
};

const rawToObject = (raw: RawInfo): StripeCustomer => {
  const { pk, sk, ...rest } = raw;

  return {
    email: pk,
    ...rest,
  };
};

export default (db: DbClient): StripeCustomerApi => ({
  getStripeCustomer: async (email: string): Promise<StripeCustomer> => {
    const raw = await db.getWithError(
      getPrimaryKey(email),
      `Stripe customer #${email} was not found.`
    );
    return rawToObject(raw as RawInfo);
  },

  saveStripeCustomer: async (
    input: StripeCustomerInput
  ): Promise<StripeCustomer> => {
    const putObj = {
      ...input,
      createdAt: new Date().toISOString(),
    };

    await db.put(objectToRaw(putObj));

    return putObj;
  },
});
