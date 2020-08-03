# Address Book

REST API that wraps Identity creation and retrieval.

## Documentation

### Get Identity by Username

Request:

```
GET /identities/username/:username
```

Response:

```
{
  "address": "0x...",
  "username": "SomeUsername",
  "publicKey": "0801122...",
  "displayName": "John Doe",
    "profilePicture": "https://...",
}
```

### Get Identity by Address

Request:

```
GET /identities/address/:address
```

Response:

```
{
  "address": "0x...",
  "username": "SomeUsername",
  "publicKey": "0801122...",
  "displayName": "John Doe",
  "profilePicture": "https://...",
}
```

### Get Multiple Identities

Request:

```
GET /identities?keys=key1,key2,...,keyN
```

Each key can be a username or an address. A maximum of 20 entries can be fetched in one go.

Response:

```
[
  "key1": {
    "address": "0x...",
    "username": "SomeUsername",
    "publicKey": "0801122..."
    "displayName": "John Doe",
    "profilePicture": "https://...",
  },
  ...
]
```

### Create Identity

Request:

```
POST /identities
Raw Body:
{
  "username": "SomeUsername",
  "publicKey": "0801122..."
}
```

Response:

```
{
  "address": "0x...",
  "createdAt": "2020-06-19T19:56:34.941Z",
  "username": "SomeUsername",
  "publicKey": "0801122..."
}
```

### Update Identity (NOT IMPLEMENTED YET)

Request

```
PUT /identities/:address
Headers: {
  Authorization: :token
}
Raw Body: {
  // All params are optional
  "username": "SomeUsername",
  "publicKey": "0801122...",
  "displayName": "John Doe",
}
```

Response:

```
{
  "address": "0x...",
  "username": "SomeUsername",
  "publicKey": "0801122..."
  "profilePicture": "https://...",
}
```

### Upload Profile Picture (NOT IMPLEMENTED YET)

Request

```
PUT /identities/:address/picture
Headers: {
  Authorization: :token
}
Multipart Upload Content...
```

Response

```
{
  "profilePicture": "https://...",
}
```