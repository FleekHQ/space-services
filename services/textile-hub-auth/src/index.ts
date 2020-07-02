/* eslint-disable import/prefer-default-export */
const requiredEnvs = [
  'TXL_USER_KEY',
  'TXL_USER_SECRET',
  'TXL_HUB_URL',
  'APIG_ENDPOINT',
  'ENV',
];

requiredEnvs.forEach(env => {
  if (!process?.env[env]) {
    throw new Error(`${env} variable not set`);
  }
});

export { handler } from './websocket';
