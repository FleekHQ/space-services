/* eslint-disable import/prefer-default-export */
import { SHA3 } from 'sha3';

/**
 * Obtains an address given a public key
 * @param pubKey The public key (in hex encoding)
 */
export const deriveAddressFromPubKey = (pubKey: string): string => {
  const hash = new SHA3(256);

  // Compute the SHA3-256 hash of the public key
  hash.update(pubKey, 'hex');

  // Get the hex representation of the SHA3-256 hash
  const hexHash = hash.digest('hex');

  // Drop the first 14 bytes (28 characters)
  const trimmedHash = hexHash.substring(28);

  return `0x${trimmedHash}`;
};

export const isValidAddress = (address: string): boolean => {
  const regex = /^0x[0-9A-Fa-f]{36}$/;
  if (address.match(regex)) {
    return true;
  }

  return false;
};
