export interface StoreVaultRequest {
  // The uuid of the user
  uuid: string;

  // The vault to store
  vault: string;

  // Vault service key
  vsk: string;
}
