/* eslint-disable import/prefer-default-export */
import forge from 'node-forge';
import axios from 'axios';
import { WriteStream } from 'fs';
import scrypt from 'scrypt-js';
import { CursorBuffer } from './CursorBuffer';

// IV is decryptions is 16 bytes
const IVLength = 16;
// Salt is 32 bytes
const SaltLength = 32;
const AesKeyLength = 32;
const HmacKeyLength = 32;
const HmacLength = 64;
const ScryptKeyLength = AesKeyLength + HmacKeyLength;

/// Decodes data using decryption key and writes its value to writestream
export const writeDecodedData = async (
  decryptionKey: Uint8Array,
  ivBytes: Uint8Array,
  data: Uint8Array,
  writer: WriteStream
): Promise<void> => {
  const decipher = forge.cipher.createDecipher(
    'AES-CTR',
    forge.util.createBuffer(decryptionKey)
  );
  decipher.start({ iv: forge.util.createBuffer(ivBytes) });

  decipher.update(forge.util.createBuffer(data));

  writer.write(forge.util.binary.raw.decode(decipher.output.getBytes()));

  const decipherSuccess = decipher.finish();
  if (!decipherSuccess) {
    console.error('Error decrypting', decipherSuccess);
  }
};

const computeDataHMAC = (
  scryptKeys: Uint8Array,
  data: Uint8Array
): {
  computedDigest: forge.util.ByteStringBuffer;
  digestInFile: forge.util.ByteStringBuffer;
} => {
  const hmacKey = scryptKeys.slice(AesKeyLength, AesKeyLength + HmacKeyLength);

  const hmacReader = new CursorBuffer(data);
  hmacReader.skipXBytes(4); // <--- usually empty

  const hmac = forge.hmac.create();
  hmac.start(
    'sha512' as forge.hmac.Algorithm,
    forge.util.createBuffer(hmacKey)
  );
  hmac.update(
    forge.util
      .createBuffer(
        hmacReader.readXBytes(hmacReader.bytesLeft - HmacLength + 1)
      )
      .getBytes()
  );

  const hmacBytes = hmacReader.readXBytes(HmacLength);
  return {
    computedDigest: hmac.digest(),
    digestInFile: forge.util.createBuffer(hmacBytes),
  };
};

interface EncryptedFileInfo {
  key: Uint8Array;
  iv: Uint8Array;
  encryptedData: Uint8Array;
}

// Fetch hash from ipfs and parses decryption information
export const downloadEncryptedFile = async (
  hash: string,
  password: string
): Promise<EncryptedFileInfo | null> => {
  let res;
  try {
    res = await axios.get<ArrayBuffer>(`https://ipfs.fleek.co/ipfs/${hash}`, {
      responseType: 'arraybuffer',
    });
  } catch (err) {
    throw new Error(
      'Downloading file failed. Confirm you have a correct share link.'
    );
  }

  const resultReader = new CursorBuffer(new Uint8Array(res.data));
  resultReader.skipXBytes(4); // <-- skip 4 bytes (usually blank)

  // read int32 (4 bytes) for -> iterations
  const iterations = resultReader.read32();
  // read SaltLength bytes from res.data -> salt
  const saltBytes = resultReader.readXBytes(SaltLength);
  // read IVLength bytes from res.data -> iv
  const ivBytes = resultReader.readXBytes(IVLength);
  // use password, salt, and iterations
  const scryptKeys = scrypt.syncScrypt(
    new TextEncoder().encode(password.normalize('NFKC')),
    saltBytes,
    iterations,
    8,
    1,
    ScryptKeyLength
  );
  const decryptionKey = scryptKeys.slice(0, AesKeyLength);

  const { computedDigest, digestInFile } = computeDataHMAC(
    scryptKeys,
    new Uint8Array(res.data)
  );
  if (computedDigest.toHex() !== digestInFile.toHex()) {
    throw new Error('Incorrect password provided');
  }

  return {
    key: decryptionKey,
    iv: ivBytes,
    encryptedData: resultReader.readXBytes(
      resultReader.bytesLeft - HmacLength + 1
    ),
  };
};
