/* eslint-disable import/prefer-default-export */
import crypto from 'crypto';

const saltSecret = process?.env?.SALT_SECRET;
if (!saltSecret || saltSecret === '') {
  throw new Error('SALT_SECRET variable not set');
}

/**
 * Computes the VskHash, which is the secret we store server-side for derived password verification
 * @param vsk The vault service key computed by the client
 * @param uuid The uuid of the user
 */
export const computeVskHash = (vsk: string, uuid: string): Buffer => {
  const vskHash = crypto.pbkdf2Sync(
    vsk, // vsk should already be a secure password since it went through a kdf in the client side.
    saltSecret + uuid, // In the event that keys got leaked, a brute force attacker would also need the saltSecret to be able to brute force
    1_000_000, // Running 1.000.000 iterations takes about a second (at least in AWS's lambda in year 2020)
    64,
    'sha512'
  );

  return vskHash;
};
