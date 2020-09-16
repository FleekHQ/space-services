import { AppTableItem } from '../types';

export interface Wallet {
  // The uuid of the owner
  ownerUuid: string;

  // The derived hash of the key or address of this wallet
  keyHash: string;

  // The amount of credits available in this wallet
  credits: number;

  // Date of creation in ISO format
  createdAt: string;
}

export interface RawWallet extends AppTableItem {
  // The amount of credits available in this wallet
  credits: number;

  // Date of creation in ISO format
  createdAt: string;
}
