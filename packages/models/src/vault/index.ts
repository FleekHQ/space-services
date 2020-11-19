import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { CreateVaultInput, Vault, RawVault } from './types';
import { BaseModel } from '../base';
import { PrimaryKey } from '../types';

import { NotFoundError } from '../errors';

const VAULT_KEY = 'vault';

export const getVaultPrimaryKey = (uuid: string, type: string): PrimaryKey => ({
  pk: uuid,
  sk: `${VAULT_KEY}/${type}`,
});

const mapVaultToDbObject = (vault: Vault): RawVault => {
  const { uuid, type, ...rest } = vault;

  return {
    ...getVaultPrimaryKey(uuid, type),
    ...rest,
    uuid,
  };
};

const parseDbObjectToVault = (raw: RawVault): Vault => {
  const vault: Vault = {
    vault: raw.vault,
    kdfHash: raw.kdfHash,
    uuid: raw.uuid,
    createdAt: raw.createdAt,
    type: raw.sk.split('#').pop(),
  };

  return vault;
};

export class VaultModel extends BaseModel {
  constructor(env: string, client: DocumentClient = new DocumentClient()) {
    const table = `space_table_${env}`;
    super(table, client);
  }

  public async storeVault(input: CreateVaultInput): Promise<Vault> {
    const createdAt = new Date(Date.now()).toISOString();

    const newVault: Vault = {
      createdAt,
      uuid: input.uuid,
      vault: input.vault,
      kdfHash: input.kdfHash,
      type: input.type,
    };

    const dbItem = mapVaultToDbObject(newVault);

    await this.put(dbItem);

    return newVault;
  }

  public async getVaultByUuid(uuid: string, type: string): Promise<Vault> {
    const rawVault = await this.get(getVaultPrimaryKey(uuid, type)).then(
      result => result.Item as RawVault
    );

    if (!rawVault) {
      throw new NotFoundError(`Vault for uuid ${uuid} not found.`);
    }

    return parseDbObjectToVault(rawVault);
  }
}

export default VaultModel;
