# Billing Models

## Access Patterns

- Create Wallet
- Claim wallet (set owner identity)
- Get wallets owned by identity

## Database structure to enable these access patterns

|                | pk          | sk             | g1pk     | g1sk      |
|----------------|-------------|----------------|----------|-----------|
| Vault          | `:key`      | `wallet`       | `:uuid`  | `wallet`  |

