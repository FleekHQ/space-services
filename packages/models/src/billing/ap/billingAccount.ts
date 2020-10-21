import { v4 as uuidv4 } from 'uuid';
import { PrimaryKey } from '../../types';
import { getUpdateExpressions } from '../../utils';
import DbClient from '../../dbTable';

export interface StripeMethodMetadata {
  card?: {
    last4: string;
    expMonth: number;
    expYear: number;
    brand: string;
    issuer?: string;
  };
  type: string;
}

export interface BillingAccount {
  id: string;
  ownerId: string;
  email?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripePaymentMethodMeta?: StripeMethodMetadata;
  createdAt: string;
}

export interface UpdateBillingAccountInput {
  email?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripePaymentMethodMeta?: StripeMethodMetadata;
}

interface RawInfo {
  pk: string;
  sk: string;
  ownerId: string;
  email?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  createdAt: string;
}

interface BillingAccountApi {
  getBillingAccount: (uuid: string) => Promise<BillingAccount>;
  createBillingAccount: (
    ownerId: string,
    email?: string
  ) => Promise<BillingAccount>;
  updateBillingAccount: (
    uuid: string,
    data: UpdateBillingAccountInput
  ) => Promise<BillingAccount>;
}

const SK_STRING = 'billing-account';

const getPrimaryKey = (uuid: string): PrimaryKey => ({
  pk: uuid,
  sk: SK_STRING,
});

const objectToRaw = (obj: BillingAccount): RawInfo => {
  const { id, ...rest } = obj;

  return {
    ...getPrimaryKey(id),
    ...rest,
  };
};

const rawToObject = (raw: RawInfo): BillingAccount => {
  const { pk, sk, ...rest } = raw;

  return {
    id: pk,
    ...rest,
  };
};

export default (db: DbClient): BillingAccountApi => ({
  getBillingAccount: async (uuid: string): Promise<BillingAccount> => {
    const raw = await db.getWithError(
      getPrimaryKey(uuid),
      `Billing account #${uuid} was not found.`
    );
    return rawToObject(raw as RawInfo);
  },

  createBillingAccount: async (
    ownerId: string,
    email?: string
  ): Promise<BillingAccount> => {
    const obj = {
      id: uuidv4(),
      email,
      createdAt: new Date().toISOString(),
      ownerId,
    };

    await db.put(objectToRaw(obj));

    return obj;
  },

  updateBillingAccount: async (
    uuid: string,
    data: UpdateBillingAccountInput
  ): Promise<BillingAccount> => {
    const Key = getPrimaryKey(uuid);
    const params = {
      TableName: db.table,
      Select: 'ALL_PROJECTED_ATTRIBUTES',
      Key,
      ...getUpdateExpressions(data, [
        'email',
        'stripeCustomerId',
        'stripePaymentMethodId',
        'stripePaymentMethodMeta',
      ]),
      ReturnValues: 'ALL_NEW',
    };

    const res = await db.update(params);

    return rawToObject(res.Attributes as RawInfo);
  },
});
