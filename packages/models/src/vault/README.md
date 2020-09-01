# Vault Models

## Access Patterns

- Store vault by uuid

- Get vault by uuid

## Database structure to enable these access patterns

|                | pk          | sk             | g1pk     | g1sk      |
|----------------|-------------|----------------|----------|-----------|
| Vault          | :uuid       | vault          | -        | -         |