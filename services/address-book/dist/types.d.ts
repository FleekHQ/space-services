export interface CreateIdentityRequest {
    username: string;
    publicKey: string;
}
export interface IdentityResult {
    publicKey: string;
    address: string;
    username: string;
}
