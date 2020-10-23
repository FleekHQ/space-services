import _ from 'lodash';
import DbTable from '../dbTable';
import accountApi, { Account, UpdateAccountInput } from './ap/account';
import billingAccountApi, {
  BillingAccount,
  UpdateBillingAccountInput,
} from './ap/billingAccount';
import stripeCustomerApi, { StripeCustomer } from './ap/stripeCustomer';
import stripeSubscriptionApi, {
  StripeSubscription,
  StripeSubscriptionInput,
} from './ap/stripeSubscription';

export type AccountWithBilling = Account & {
  billingAccount: BillingAccount;
};

interface ModelApi {
  getOrCreateAccount: (ownerId: string) => Promise<AccountWithBilling>;
  saveStripeCustomer: (
    email: string,
    uuid: string,
    stripeCustomerId: string
  ) => Promise<StripeCustomer>;
  getStripeCustomer: (email: string) => Promise<StripeCustomer>;
  updateBillingAccount: (
    uuid: string,
    data: UpdateBillingAccountInput
  ) => Promise<BillingAccount>;
  saveStripeSubscription: (
    data: StripeSubscriptionInput
  ) => Promise<StripeSubscription>;

  getStripeSubscription: (id: string) => Promise<StripeSubscription>;
  updateAccount: (
    accountId: string,
    data: UpdateAccountInput
  ) => Promise<Account>;
}

export default (env: string): ModelApi => {
  const db = new DbTable(`space_table_${env}`);
  const dbApi = _.extend(
    {},
    accountApi(db),
    billingAccountApi(db),
    stripeCustomerApi(db),
    stripeSubscriptionApi(db)
  );

  return {
    getOrCreateAccount: async (
      ownerId: string
    ): Promise<AccountWithBilling> => {
      let account: Account;
      let billingAccount: BillingAccount;

      try {
        account = await dbApi.getAccount(ownerId);
        billingAccount = await dbApi.getBillingAccount(
          account.billingAccountId
        );
      } catch (e) {
        billingAccount = await dbApi.createBillingAccount(ownerId);
        account = await dbApi.createAccount({
          billingAccountId: billingAccount.id,
          id: ownerId,
          type: 'personal',
        });
      }

      return _.extend(account, { billingAccount });
    },

    getStripeCustomer: async (email: string): Promise<StripeCustomer> => {
      return dbApi.getStripeCustomer(email);
    },

    saveStripeCustomer: async (
      email: string,
      uuid: string,
      stripeCustomerId: string
    ): Promise<StripeCustomer> => {
      return dbApi.saveStripeCustomer({
        email,
        uuid,
        stripeCustomerId,
      });
    },

    updateBillingAccount: async (
      billingAccountId: string,
      data: UpdateBillingAccountInput
    ): Promise<BillingAccount> => {
      return dbApi.updateBillingAccount(billingAccountId, data);
    },

    saveStripeSubscription: async (
      data: StripeSubscriptionInput
    ): Promise<StripeSubscription> => {
      return dbApi.createStripeSubscription(data);
    },

    getStripeSubscription: async (id: string): Promise<StripeSubscription> => {
      return dbApi.getStripeSubscription(id);
    },

    updateAccount: async (
      accountId: string,
      data: UpdateAccountInput
    ): Promise<Account> => {
      return dbApi.updateAccount(accountId, data);
    },
  };
};
