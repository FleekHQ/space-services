# Identity Models

## Access Patterns

- Get identity by username

- Get identity by email

- Get identity by address

- Get identity by [Insert other provider here]

## Database structure to enable these access patterns

|                | pk       | sk             | g1pk     | g1sk      |
|----------------|----------|----------------|----------|-----------|
| Identity       | identity | :username      | identity | :address  |
| Email Proofs   | email    | :email         | proof    | :username |
| Twitter Proofs | twitter  | :twitterHandle | proof    | :username |

1- Get identity by username: pk=identity, sdk=:username

2- Get identity by email: pk=email, sk=:email, then use username at sk and pk=identity

3- Get identity by address: g1pk=identity, g1sk=:address

4- Same as (2)
