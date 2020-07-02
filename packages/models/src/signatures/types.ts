import { AppTableItem } from '../types';

export interface Signature {
  /**
   * Base32 encoded public key
   */
  publicKey: string;

  /**
   * Challenge signed by private key
   */
  signature: string;
}

export interface RawSignature extends AppTableItem {
  publicKey: string;
  signature: string;
}
