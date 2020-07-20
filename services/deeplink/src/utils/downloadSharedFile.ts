import forge from 'node-forge';
import axios from 'axios';
import { WriteStream } from 'fs';

// IV is decryptions is 16 bytes
export const IVLength = 16;

// Fetch hash from ipfs and decrypts with key
export const downloadEncryptedFile = async (
  hash: string,
  encodedKey: string,
  saveStreamWriter: WriteStream
): Promise<void> => {
  try {
    const res = await axios.get<ArrayBuffer>(
      `https://ipfs.fleek.co/ipfs/${hash}`,
      {
        responseType: 'arraybuffer',
      }
    );

    const writeEncoder = new TextEncoder();
    const keyBytes = atob(encodedKey);
    const iv = keyBytes.slice(0, IVLength);
    const decryptionKey = keyBytes.slice(IVLength);
    const decipher = forge.cipher.createDecipher('AES-CTR', decryptionKey);
    decipher.start({ iv });

    decipher.update(forge.util.createBuffer(res.data));

    // console.log('Decypher output', decipher.output.getBytes());
    saveStreamWriter.write(writeEncoder.encode(decipher.output.getBytes()));

    const decipherSuccess = decipher.finish();
    if (!decipherSuccess) {
      console.error('Error decrypting', decipherSuccess);
    }
  } catch (error) {
    console.error('Error Decrypting file', error);
  }
};
