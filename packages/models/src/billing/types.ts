import { Integer } from 'aws-sdk/clients/dynamodb';
import { AppTableItem } from '../types';

export interface Wallet {
  // The uuid of the owner
  ownerUuid: string;

  // The key or address of this wallet
  key: string;

  // The amount of credits available in this wallet
  credits: Integer;

  // Date of creation in ISO format
  createdAt: string;
}

export interface RawWallet extends AppTableItem {
  // The amount of credits available in this wallet
  credits: Integer;

  // Date of creation in ISO format
  createdAt: string;
}
