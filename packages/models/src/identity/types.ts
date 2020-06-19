import { AppTableItem } from '../types';

export interface CreateIdentityInput {
  // The public key of the identity
  publicKey: string;

  // Human readable identifier
  username: string;
}

export interface Identity {
  // The public key of the identity
  publicKey: string;

  // Hexadecimal string that is derived from a public key
  address: string;

  // Human readable identifier
  username: string;

  // Date of creation in ISO format
  createdAt: string;

  // TODO: Twitter handle or other identity providers
}

export interface RawIdentity extends AppTableItem {
  // The public key of the identity
  publicKey: string;

  // Hexadecimal string that is derived from a public key
  address: string;

  // Human readable identifier
  username: string;

  // Date of creation in ISO format
  createdAt: string;
}

export interface CreateProofInput {
  // The type of proof
  proofType: ProofType;

  // The value of the proof. E.g. if this is an email proof, the value would be the actual email
  value: string;

  // The username of the user this proof belongs to
  username: string;
}

export enum ProofType {
  email = 'email',
}

export interface Proof {
  // The type of proof
  proofType: ProofType;

  // The value of the proof. E.g. if this is an email proof, the value would be the actual email
  value: string;

  // The username of the user this proof belongs to
  username: string;

  // Date of creation in ISO format
  createdAt: string;
}

export interface RawProof extends AppTableItem {
  // The type of proof
  proofType: ProofType;

  // The value of the proof. E.g. if this is an email proof, the value would be the actual email
  value: string;

  // The username of the user this proof belongs to
  username: string;

  // Date of creation in ISO format
  createdAt: string;
}
