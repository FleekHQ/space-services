import _ from 'lodash';
import { AccountWithBilling } from '@packages/models';

// eslint-disable-next-line
export const accountResponse = (accountWithBilling: AccountWithBilling) =>
  _.pick(accountWithBilling, [
    'type',
    'credits',
    'plan',
    'createdAt',
    'estimatedCost',
    'billingAccount',
    'billingPeriodStart',
    'billingPeriodEnd',
    'billingMode',
  ]);
