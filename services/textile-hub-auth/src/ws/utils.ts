import { createAPISig, Client } from '@textile/hub';

/**
 * getAPISig uses helper function to create a new sig
 *
 * seconds (300) time until the sig expires
 */
export const getAPISig = (seconds: number = 300) => {
  const expiration = new Date(Date.now() + 1000 * seconds);
  return createAPISig(process.env.TXL_USER_SECRET, expiration);
};

export const createTextileClient = async (): Promise<Client> => {
  const API = process.env.API || undefined;

  const client = await Client.withKeyInfo(
    {
      key: process.env.TXL_USER_KEY,
      secret: process.env.TXL_USER_SECRET,
    },
    API
  );

  return client;
};
