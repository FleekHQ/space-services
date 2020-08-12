import { Identity, RawIdentity, Proof, RawProof } from './types';

// Note: Read ./README.md for details on access patterns

export const IDENTITY_KEY = 'id';
export const PROOF_KEY = 'proof';

export const mapIdentityDbObject = (identity: Identity): RawIdentity => {
  return {
    pk: `${IDENTITY_KEY}#${identity.username}`,
    sk: IDENTITY_KEY,
    gs1pk: identity.address,
    gs1sk: IDENTITY_KEY,
    ...identity,
  };
};

export const parseDbObjectToIdentity = (dbObject: RawIdentity): Identity => ({
  address: dbObject.address,
  username: dbObject.username,
  publicKey: dbObject.publicKey,
  createdAt: dbObject.createdAt,
});

export const mapProofDbObject = (proof: Proof): RawProof => {
  return {
    pk: `${PROOF_KEY}#${proof.value}`,
    sk: proof.proofType,
    gs1pk: `${IDENTITY_KEY}#${proof.username}`,
    gs1sk: `${PROOF_KEY}#${proof.proofType}`,
    ...proof,
  };
};

export const parseDbObjectToProof = (dbObject: RawProof): Proof => ({
  value: dbObject.value,
  username: dbObject.username,
  proofType: dbObject.proofType,
  createdAt: dbObject.createdAt,
});
