import { deriveAddressFromPubKey } from '../src';

const VALID_PUB_KEY =
  '67730a6678566ead5911d71304854daddb1fe98a396551a4be01de65da01f3a9';

describe('deriveAddressFromPubKey', () => {
  it('converts a public key correctly', () => {
    const result = deriveAddressFromPubKey(VALID_PUB_KEY);

    expect(result).toMatchSnapshot();
    expect(result).toHaveLength(38);
  });
});
