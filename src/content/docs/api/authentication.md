---
title: Authentication
description: Learn how to authenticate with the HappyPathology API.
draft: true
---

All authenticated calls to the HappyPathology API require an `Authorization` header containing a signed and valid token. There are two authentication methods available:

1.  **Session-Based Authentication**
2.  **Public-Private Key Authentication**

## Session-Based Authentication

This method is ideal for interactive applications where users have individual HappyPathology accounts. Examples include web applications, mobile apps, and desktop applications.

### Obtaining a Token

To obtain an authorization token:

1.  Call the `/auth/login` endpoint for a specific region.
2.  Provide a username and password hash (SHA-256 of the actual password).
3.  A token will be returned for you to use.

> **Note**: Never send raw passwords. Always use the SHA-256 hash for security.

### Generating Password Hash

Here are code examples showing how to generate the password hash (sha256) that you will need to send along a user name to the auth endpoint.

```go
package main

// SECURITY RISK:
// Please ONLY use this for debugging login problems.
// MAKE SURE TO REMOVE THIS FROM YOUR SHELL HISTORY.

import (
    "crypto/sha256"
    "fmt"
)

func main() {
    shasum := sha256.Sum256([]byte("YOUR_ACTUAL_PASSWORD"))
    fmt.Printf("%x", shasum)
}
```

```typescript
// SECURITY RISK:
// Please ONLY use this for debugging login problems.
// MAKE SURE TO REMOVE THIS FROM YOUR SHELL HISTORY.

import { CryptoJS } from 'crypto'
const passSha = CryptoJS.SHA256('YOUR_ACTUAL_PASSWORD').toString(CryptoJS.enc.Hex)
console.log(passSha)
```

### Login Request Example

```shell
# SECURITY RISK:
# Please ONLY use this for debugging login problems.
# MAKE SURE TO REMOVE THIS FROM YOUR SHELL HISTORY.

export PASS_SHA_256=`echo -n YOUR_ACTUAL_PASSWORD | shasum -a 256 | cut -d ' ' -f 1`
echo '{"user":"ali@example.com","pass_hash":"'${PASS_SHA_256}'"}' | \
http -F POST https://in.api.happypathology.com/auth/login
```

### Sample Response

```json
{
  "status": 202,
  "results": {
    "login_timestamp": "1682945428455621477",
    "token": {
      "HY_APP_AUTH_v1": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9E....."
    },
    "user": {
      "email": "ali@example.com",
      "id": "03349841-588d-56b3-b93c-52d0983f9c75",
      "screen_name": "Ali",
      "user_name": "ali@example.com"
    }
  },
  "debug_info": {
    "delta": "463.021938ms",
    "version": "bb_api.362.pbs_tasks.dfd119b"
  }
}
```

## Public-Private Key Authentication

This method is suitable for automated systems or devices that need to make API calls without user interaction. It's also useful for applications where users don't have individual HappyPathology accounts.

### Key Registration

A self-service dashboard for registering public keys is coming soon. In the meantime, please contact HappyPathology support to register your public keys.

### JWT Specifications

HappyPathology uses JSON Web Tokens (JWT) for authorization headers. For detailed information, visit [jwt.io](https://jwt.io/).

#### Supported Signing Algorithms

-   `RSA384` (RSASSA-PKCS-v1.5 using SHA-384)
-   `RS256` (RSASSA-PKCS-v1.5 using SHA-256)

#### Required JWT Fields

| JWT Claim | Abbreviated | Data Type | Description |
| :--- | :--- | :--- | :--- |
| Token ID | `jti` | String | Unique ID for each token (e.g., UUID or high-resolution timestamp) |
| Issuer | `iss` | String | Identifier of your organization |
| Issued at | `iat` | IntDate | Token issue time (Unix timestamp) |
| Expiration | `exp` | IntDate | Token expiration time (Unix timestamp, max 1 hour from issue) |
| Audience | `aud` | String | API domain and region (e.g., `us.api.happypathology.com`) |
| User ID | `sub` | String | User ID from the organization owning the signing key |
| Role | `role` | String | User role (`admin`, `user`, `device`, or `service`) |
| Key ID * | `kid` | String | Required for `RS256` algorithm. ID of the public key used for signing |

> **Note**: All fields are case-sensitive and required. JWTs must be BASE64 encoded when used as Authorization headers.

### Creating Key Pairs

Here is an example shell command to create a key pair. You can then share ONLY THE PUBLIC key with HappyPathology. Keep the private key safe. You will be using the private key to sign your own authorization headers.

Anyone with access to your private key can impersonate you and your users, devices and servers.

```shell
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
cat jwtRS256.key
cat jwtRS256.key.pub
```

### Sample JWT Structure

```json
{
  "alg": "RS256",
  "typ": "JWT"
}
.
{
  "aud": ["us.api.happypathology.com"],
  "exp": 1683095428,
  "iat": 1682945428,
  "iss": "1stdevision.example.com",
  "jti": "2d33d1d518",
  "sub": "01234567-789d-46b7-b38c-45d4562f5c12",
  "role": "user",
  "kid": "01234567-789d-46b7-b38c-45d4562f5c12"
}
```

### Debugging JWTs

-   Decode and inspect JWTs at [jwt.io](https://jwt.io/).
-   Use the `/auth/hello` endpoint for detailed JWT information and potential rejection reasons.

```shell
http -f POST https://dev.api.happypathology.com/auth/hello Authorization:HAPPYPATHOLOGY_AUTH_TOKEN
```
