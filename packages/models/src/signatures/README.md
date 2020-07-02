# Signature Model

Used by Textile Hub Auth lambda to retrieve and store identity proofs (signed challenges)

## Access Patterns

- Get signature by public key

## Database structure to enable these access patterns

|                | pk                   | sk             | g1pk                 | g1sk        |
|----------------|----------------------|----------------|----------------------|-------------|
| Signature      | publicKeyToSignature | :publicKey     | signatureToPublicKey | :signature  |
