import { PrimaryKey } from '../../types';
import DbClient from '../../dbTable';

export enum PaymentType {
  STRIPE = 'stripe',
}

export interface Payment {
  id: string;
  billingAccountId: string;
  createdAt: string;
  usdValue: string;
  type: PaymentType;
}

interface RawInfo {
  pk: string;
  sk: string;
  gs1pk: string;
  gs1sk: string;
  createdAt: string;
  usdValue: string;
  type: PaymentType;
}

export interface SavePaymentInput {
  id: string;
  billingAccountId: string;
  createdAt: string;
  usdValue: string;
  type: PaymentType;
}

interface PaymentApi {
  savePayment: (data: SavePaymentInput) => Promise<Payment>;
}

const SK_STRING = 'payment';

const getPrimaryKey = (uuid: string): PrimaryKey => ({
  pk: uuid,
  sk: SK_STRING,
});

const objectToRaw = (obj: Payment): RawInfo => {
  const { id, billingAccountId, ...rest } = obj;

  return {
    ...getPrimaryKey(id),
    gs1pk: billingAccountId,
    gs1sk: SK_STRING,
    ...rest,
  };
};

// const rawToObject = (raw: RawInfo): Payment => {
//   const { pk, sk, gs1pk, gs1sk, ...rest } = raw;

//   return {
//     id: pk,
//     billingAccountId: gs1pk,
//     ...rest,
//   };
// };

export default (db: DbClient): PaymentApi => ({
  savePayment: async (data: SavePaymentInput): Promise<Payment> => {
    const obj: Payment = data;
    await db.put(objectToRaw(obj));
    return obj;
  },
});
