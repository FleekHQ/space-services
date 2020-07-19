import { isValidAddress } from '../src';

const VALID_ADDRESS = '0xd606f05a2a980f58737aa913553c8d6eac8b';
const INVALID_ADDRESS = '0xd606f05a2a980f58737aa913553c8d6eac8';

describe('isValidAddress', () => {
  it('returns true for a valid address', () => {
    const result = isValidAddress(VALID_ADDRESS);

    expect(result).toBeTruthy();
  });

  it('returns false for an invalid address', () => {
    const result = isValidAddress(INVALID_ADDRESS);

    expect(result).toBeFalsy();
  });
});
