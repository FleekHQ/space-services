import crypto from 'crypto';

const publicSalt = 'space_billing_salt';

const deriveKey = (base58Key: string): string => {
  // NOTE: Not worrying about using a public salt since base58key is already secure by itself.
  // The chances of both the database leaking plus someone force-brutting 16-character passwords
  // just to get some free storage credits seem pretty low.
  const res = crypto.pbkdf2Sync(base58Key, publicSalt, 100_000, 64, 'sha512');
  return res.toString('hex');
};

export default deriveKey;
