# Identity Models

## Access Patterns

- Get identity by uuid (`pk=:uuid sk=id`)
- Get identity by username (`pk=u#:username sk=username`, then use `gs1pk` as `uuid` to fetch identity by uuid)
- Get identity by email (`pk=proof#:email, sk=email`, then use `gs1pk` as `uuid` to fetch identity by uuid)
- Get identity by address (`pk=:address, sk=address`, then use `gs1pk` as `uuid` to fetch identity by uuid)
- Get identity by [Insert other provider here]

## Database structure to enable these access patterns

|                | pk                      | sk               | gs1pk           | gs1sk           |
|----------------|-------------------------|------------------|-----------------|-----------------|
| Identity       | `:uuid`                 | `id`             |                 |                 |
| Username       | `u#:username`           | `username`       | `:uuid`         | `username`      |
| Address        | `:address`              | `address`        | `:uuid`         | `address`       |
| Email Proofs   | `proof#:email`          | `email`          | `:uuid`         | `proof#email`   |
| Twitter Proofs | `proof#:twitterHandle`  | `twitter`        | `:uuid`         | `proof#twitter` |
