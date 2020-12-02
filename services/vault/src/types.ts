export interface StoreVaultRequest {
  // The vault to store
  vault: string;

  // vault type
  type: string;

  // Vault service key
  vsk?: string;
}

export interface RetrieveVaultRequest {
  // vault type
  type: string;

  // Vault service key
  vsk: string;
}

export interface RetrieveVaultResponse {
  encryptedVault: string;
}
