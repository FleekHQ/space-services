export interface StoreVaultRequest {
  // The vault to store
  vault: string;

  // Vault service key
  vsk?: string;
}

export interface RetrieveVaultRequest {
  // Vault service key
  vsk: string;
}

export interface RetrieveVaultResponse {
  encryptedVault: string;
}
