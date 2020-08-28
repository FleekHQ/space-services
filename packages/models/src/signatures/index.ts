import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Signature, RawSignature } from './types';
import { BaseModel } from '../base';
import { NotFoundError } from '../errors';

const mapSignatureDbObject = (sig: Signature): RawSignature => {
  return {
    pk: `sig#${sig.publicKey}`,
    sk: `signature`,
    signature: sig.signature,
  };
};

const parseDbObjectToSignature = (raw: RawSignature): Signature => ({
  publicKey: raw.pk.split('#').pop(),
  signature: raw.signature,
});

export class SignatureModel extends BaseModel {
  constructor(env: string, client: DocumentClient = new DocumentClient()) {
    const table = `space_table_${env}`;
    super(table, client);
  }

  public async createSignature(
    publicKey: string,
    signature: string
  ): Promise<Signature> {
    const newSig: Signature = {
      publicKey,
      signature,
    };

    const dbItem = mapSignatureDbObject(newSig);
    console.log('putting signature', dbItem);
    await this.put(dbItem);

    return newSig;
  }

  public async getSignatureByPublicKey(publicKey: string): Promise<Signature> {
    const stubSig = mapSignatureDbObject({
      publicKey,
      signature: '',
    });

    const rawSig = await this.getItem(stubSig.pk, stubSig.sk);

    if (!rawSig.Item || !rawSig.Item.pk) {
      throw new NotFoundError(
        `Signature with public key ${publicKey} not found.`
      );
    }

    return parseDbObjectToSignature(rawSig.Item as RawSignature);
  }

  public async deleteSignatureByPublicKey(publicKey: string): Promise<void> {
    const sig = await this.getSignatureByPublicKey(publicKey);
    const raw = mapSignatureDbObject(sig);

    await this.delete({
      pk: raw.pk,
      sk: raw.sk,
    });
  }
}

export default SignatureModel;
