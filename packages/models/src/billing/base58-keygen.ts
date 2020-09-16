export const alphabet =
  '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'; // base58
const base = alphabet.length;

// returns random int between min (inclusive) and max (exclusive)
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const base58Keygen = (length = 16): string => {
  let result = '';

  for (let i = 0; i < length; i += 1) {
    const currIndex = randomInt(0, base);
    const currChar = alphabet[currIndex];
    result += currChar;
  }

  return result;
};

export default base58Keygen;
