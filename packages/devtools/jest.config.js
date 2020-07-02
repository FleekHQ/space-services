module.exports = {
  roots: ['tests'],
  testPathIgnorePatterns: [
    '<rootDir>/tests(.*)/skip-ci/',
    '<rootDir>/tests/helpers/',
  ],
  testRegex: '(.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
