# Space Services

This repo contains the "back-end" side of Space app. It relies on Serverless Framework to deploy AWS resources. The idea of these services is to provide convenience and discoverability between Space users. However, the app should still work without these.

## Structure

### packages

Contains shared typescript modules that can be used from any service.

### resources

Contains serverless definitions for deploying parts of the stack that don't change too much, such as databases.

### services

Contains APIs and lambda functions that are exposed to the users.

## Commands

`lerna bootstrap`: Install all dependencies and node modules.

`yarn build:packages`: Builds all packages.

## Deployment Steps

This will be configured in CI soon.

### Create the secrets

We use AWS's Parameter Store to store secret values that will get injected as env vars into services. The secrets needed are:

- txl-user-key-${env}
- txl-user-secret-${env}
- txl-hub-url-${env}

(where `env` is the current deployed environment as prd or stg)

### Deploy the resources

If the resources have not been created yet, run the following command in each of the resource folders: `sls --stage [CURR_STAGE] deploy`.

### Deploy the services

1- Install dependencies

2- Build packages

3- Go to the folder of the service you want to deploy and build it using `yarn build`.

4- Deploy the service using `sls --stage [CURR_STAGE] deploy`.

