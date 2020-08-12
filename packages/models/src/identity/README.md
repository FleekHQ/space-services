# Identity Models

## Access Patterns

- Get identity by username

- Get identity by email

- Get identity by address

- Get identity by [Insert other provider here]

## Database structure to enable these access patterns

|                | pk                      | sk             | g1pk            | g1sk          |
|----------------|-------------------------|----------------|-----------------|---------------|
| Identity       | `id#:username`          | id             | :address        | id            |
| Email Proofs   | `proof#:email`          | email          | id#:username    | proof#email   |
| Twitter Proofs | `proof#:twitterHandle`  | twitter        | id#:username    | proof#twitter |

1- GetItem: identity by username: pk=id#username, sk=id

2- GetItem: identity by email: pk=proof#:email, sk=email, then use username to get identity

3- Query: identity by address: g1pk=:address, g1sk=id

4- Same as (2)
