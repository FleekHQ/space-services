import base58Keygen, { alphabet } from '../src/billing/base58-keygen';

describe('billing', () => {
  describe('base58Keygen', () => {
    it('generates a correct base58 key', () => {
      const key = base58Keygen(16);

      expect(key.length).toEqual(16);
      for (let i = 0; i < key.length; i += 1) {
        const currChar = key[i];
        expect(alphabet.includes(currChar)).toBeTruthy();
      }
    });
  });
});
