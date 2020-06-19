import { deriveAddressFromPubKey } from '../src';

const VALID_PUB_KEY =
  '080112200c0f5e55f4f32af31bf39e1a3703adee3d0141f84f752c1a6522fb358f9c3ac8';

describe('deriveAddressFromPubKey', () => {
  it('converts a public key correctly', () => {
    const result = deriveAddressFromPubKey(VALID_PUB_KEY);

    expect(result).toMatchSnapshot();
    expect(result).toHaveLength(38);
  });
});
