import { IdentityRecord as Identity } from './types';

import { ValidationError } from '../errors';

interface IdentityModel {
  getIdentityByAddress: (string) => Promise<Identity>;
  getIdentityByUsername: (string) => Promise<Identity>;
}

// eslint-disable-next-line import/prefer-default-export
export const validateIdentity = async (
  model: IdentityModel,
  identity: Identity
): Promise<void> => {
  if (!identity.publicKey.match(/^[a-fA-F\d]{64}$/)) {
    throw new ValidationError('Address must be in format ^[a-fA-Fd]{64}$');
  }

  let foundIdentityByAddress = true;
  try {
    await model.getIdentityByAddress(identity.address);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      foundIdentityByAddress = false;
    }
  }

  if (foundIdentityByAddress) {
    throw new ValidationError(
      'An identity with the given address already exists'
    );
  }

  if (identity.username) {
    if (
      !identity.username.match(
        /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/
      )
    ) {
      throw new ValidationError(
        'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.'
      );
    }

    let foundIdentityByUsername = true;
    try {
      await model.getIdentityByUsername(identity.username);
    } catch (err) {
      if (err.name === 'NotFoundError') {
        foundIdentityByUsername = false;
      }
    }

    if (foundIdentityByUsername) {
      throw new ValidationError(
        'An identity with the given username already exists'
      );
    }
  }
};
