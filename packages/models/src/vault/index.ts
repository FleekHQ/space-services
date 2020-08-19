import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { CreateVaultInput, Vault, RawVault } from './types';
import { BaseModel } from '../base';
import { NotFoundError } from '../errors';

const mapVaultToDbObject = (vault: Vault): RawVault => ({
  pk: `vault#${vault.uuid}`,
  sk: vault.uuid,
  ...vault,
});

const parseDbObjectToVault = (raw: RawVault): Vault => {
  const vault = { ...raw };
  delete vault.pk;
  delete vault.sk;
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
    };

    const dbItem = mapVaultToDbObject(newVault);

    await this.put(dbItem);

    return newVault;
  }

  public async getVaultByUuid(uuid: string): Promise<Vault> {
    const stubVault = mapVaultToDbObject({
      uuid,
      vault: '',
      kdfHash: '',
      createdAt: '',
    });

    const rawVault = await this.getItem(stubVault.pk, stubVault.sk);

    if (!rawVault.Item || !rawVault.Item.pk) {
      throw new NotFoundError(`Vault for uuid ${uuid} not found.`);
    }

    return parseDbObjectToVault(rawVault.Item as RawVault);
  }
}

export default VaultModel;
