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

- `txl-hub-url-${env}` - Textile Hub endpoint (default https://api.textile.io:443)
- `txl-user-key-${env}` - Textile Hub user key
- `txl-user-secret-${env}` - Textile Hub user secret
- `space-ipfs-host-${env}` - Public or Private address of IPFS node (used for uploading avatar image)
- `space-ipfs-sg` - AWS Security Group which is allowed to access IPFS node
- `space-ipfs-subnet` - AWS Private Subnet ID where IPFS node is deployed
- `space-api-edge-certificate-arn` - Edge Certificate ARN (used to configure custom domains for Edge API Gateways)
- `space-api-certificate-arn` - Regional Certificate ARN (used to configure custom domains for WebSocket API Gateways)
- `org-arn` (This is only the ID provided by AWS to find resources by their ARN. Generally a 12-digit integer)
- `vault-salt-secret-${env}` (Random string used for vault salt)


Where `env` is the current deployed environment, e.g. prd or stg.

### Deploy the resources

If the resources have not been created yet, run the following command in each of the resource folders: `sls --stage [CURR_STAGE] deploy`.

### Attaching custom domains

You can configure custom domains in `serverless.yaml` (each service has own domain). These domains needs to be deployed by: `sls create_domain --stage [CURR_STAGE]`, before `sls deploy --stage [CURR_STAGE]`. You can also disable custom domains by disabling `serverless-domain-manager` plugin:

```
plugins:
  - serverless-jetpack
#  - serverless-domain-manager
```

### Deploy the services

1- Install dependencies

2- Build packages

3- Go to the folder of the service you want to deploy and build it using `yarn build`.

4- Deploy the service using `sls --stage [CURR_STAGE] deploy`.
