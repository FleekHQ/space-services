import { Identity, RawIdentity, Proof, RawProof } from './types';

// Note: Read ./README.md for details on access patterns

export const IDENTITY_KEY = 'identity';
export const PROOF_KEY = 'proof';

export const mapIdentityDbObject = (identity: Identity): RawIdentity => {
  return {
    pk: IDENTITY_KEY,
    sk: identity.username,
    gs1pk: IDENTITY_KEY,
    gs1sk: identity.address,
    ...identity,
  };
};

export const parseDbObjectToIdentity = (dbObject: RawIdentity): Identity => ({
  address: dbObject.gs1sk,
  username: dbObject.sk,
  publicKey: dbObject.publicKey,
  createdAt: dbObject.createdAt,
});

export const mapProofDbObject = (proof: Proof): RawProof => {
  return {
    pk: PROOF_KEY,
    sk: proof.value,
    gs1pk: PROOF_KEY,
    gs1sk: proof.username,
    ...proof,
  };
};

export const parseDbObjectToProof = (dbObject: RawProof): Proof => ({
  value: dbObject.sk,
  username: dbObject.gs1sk,
  proofType: dbObject.proofType,
  createdAt: dbObject.createdAt,
});
