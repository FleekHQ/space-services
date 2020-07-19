export interface CreateIdentityRequest {
  username: string;
  publicKey: string;
}

export interface GetIdentitiesResponse {
  [key: string]: IdentityResult;
}

export interface IdentityResult {
  // The public key of the identity
  publicKey: string;

  // Hexadecimal string that is derived from a public key
  address: string;

  // Human readable identifier
  username: string;
}
