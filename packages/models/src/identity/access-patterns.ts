import {
  IdentityRecord,
  RawIdentityRecord,
  ProofRecord,
  RawProofRecord,
  UsernameRecord,
  RawUsernameRecord,
  RawAddressRecord,
  AddressRecord,
} from './types';
import { PrimaryKey } from '../types';

// Note: Read ./README.md for details on access patterns

export const IDENTITY_KEY = 'id';
export const PROOF_KEY = 'proof';

export const getIdentityPrimaryKey = (uuid: string): PrimaryKey => ({
  pk: uuid,
  sk: IDENTITY_KEY,
});

export const getProofPrimaryKey = (
  value: string,
  type: string
): PrimaryKey => ({
  pk: `${PROOF_KEY}#${value}`,
  sk: type,
});

export const getUsernamePrimaryKey = (username: string): PrimaryKey => ({
  pk: `u#${username}`,
  sk: `username`,
});

export const getAddressPrimaryKey = (address: string): PrimaryKey => ({
  pk: address,
  sk: `address`,
});

export const mapIdentityDbObject = (
  identity: IdentityRecord
): RawIdentityRecord => {
  const { uuid, ...rest } = identity;

  return {
    ...getIdentityPrimaryKey(uuid),
    ...rest,
  };
};

export const parseDbObjectToIdentity = (
  dbObject: RawIdentityRecord
): IdentityRecord => ({
  uuid: dbObject.pk,
  address: dbObject.address,
  username: dbObject.username,
  displayName: dbObject.displayName,
  publicKey: dbObject.publicKey,
  createdAt: dbObject.createdAt,
  avatarUrl: dbObject.avatarUrl,
});

export const mapProofDbObject = (proof: ProofRecord): RawProofRecord => {
  return {
    ...getProofPrimaryKey(proof.value, proof.type),
    gs1pk: proof.uuid,
    gs1sk: `${PROOF_KEY}#${proof.type}`,
    ...proof,
  };
};

export const parseDbObjectToProof = (
  dbObject: RawProofRecord
): ProofRecord => ({
  value: dbObject.value,
  uuid: dbObject.uuid,
  type: dbObject.type,
  createdAt: dbObject.createdAt,
});

export const mapUsernameDbObject = (
  input: UsernameRecord
): RawUsernameRecord => {
  return {
    ...getUsernamePrimaryKey(input.username),
    gs1pk: input.uuid,
    gs1sk: `username`,
    createdAt: input.createdAt,
  };
};

export const parseDbObjectToUsername = (
  dbObject: RawUsernameRecord
): UsernameRecord => ({
  uuid: dbObject.gs1pk,
  username: dbObject.pk.split(`#`).pop(),
  createdAt: dbObject.createdAt,
});

export const mapAddressDbObject = (input: AddressRecord): RawAddressRecord => {
  return {
    ...getAddressPrimaryKey(input.address),
    gs1pk: input.uuid,
    gs1sk: `address`,
    createdAt: input.createdAt,
  };
};

export const parseDbObjectToAddress = (
  dbObject: RawAddressRecord
): AddressRecord => ({
  uuid: dbObject.gs1pk,
  address: dbObject.pk,
  createdAt: dbObject.createdAt,
});
