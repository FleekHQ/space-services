import { Usage, Users, GetUsageResponse } from '@textile/users';
import _ from 'lodash';
import multibase from 'multibase';

import { Context } from '@textile/context';

const hexToBase32 = (hex: string): string =>
  Buffer.from(
    multibase.encode('base32', Buffer.from(`08011220${hex}`, 'hex'))
  ).toString();

export const getUsage = async (pubkey: string): Promise<GetUsageResponse> => {
  const ctx = new Context(process.env.TXL_HUB_URL);

  const users = await Users.withKeyInfo(
    {
      key: process.env.TXL_USER_KEY,
      secret: process.env.TXL_USER_SECRET,
    },
    ctx
  );

  const dependentUserKey = hexToBase32(pubkey);

  return users.getUsage({
    dependentUserKey,
  });
};

export const aggregateUsageMap = (
  usageMap: Array<[string, Usage]>
): Record<string, number> => {
  const aggregated = _.reduce(
    usageMap,
    (acc: Record<string, number>, [str, usage]) => {
      if (!acc[str]) {
        acc[str] = 0;
      }

      acc[str] = usage.total;

      return acc;
    },
    {}
  );

  return aggregated;
};

export const getAggregatedUsage = async (
  pubkey: string
): Promise<Record<string, number>> => {
  const usage = await getUsage(pubkey);
  return aggregateUsageMap(usage.customer.dailyUsageMap);
};
