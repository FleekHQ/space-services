export interface CreateVaultInput {
  // The uuid of the user
  uuid: string;

  // The vault to store
  vault: string;

  // Hash obtained by running a key derivation function on top of the client provided secret
  kdfHash: string;
}

export interface Vault {
  // The uuid of the user
  uuid: string;

  // The vault to store
  vault: string;

  // Hash obtained by running a key derivation function on top of the client provided secret
  kdfHash: string;

  // Date of creation in ISO format
  createdAt: string;
}

export interface RawVault {
  pk: string;
  sk: string;

  // The uuid of the user
  uuid: string;

  // The vault to store
  vault: string;

  // Hash obtained by running a key derivation function on top of the client provided secret
  kdfHash: string;

  // Date of creation in ISO format
  createdAt: string;
}
