# Vault Service

REST API that wraps Vault creation and retrieval.

## Documentation

### Store Vault

Stores a vault (overrides any existing ones for the given `uuid`). Requires the client to send a correct `vsk`. To understand the protocol, see the [Space Daemon Vault Documentation](https://github.com/FleekHQ/space-daemon/blob/master/docs/crypto/vault.md).

Request

```
POST /vaults/:address
Headers: {
  Authorization: :token
}
Raw Body: {
  "uuid": "1234-5678...",
  "vault": "someEncryptedContent",
  "vsk": "theVaultServiceKey",
}
```

Response:

```
200
```
