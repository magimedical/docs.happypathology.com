---
title: Getting Started
description: Learn how to start using the HappyPathology API.
---

Welcome to the HappyPathology API!

This guide will help you get up and running quickly.

## Prerequisites

Before you begin, ensure you have:

- A signing key pair for the dev and one for prod environment (contact support if you don't have one)
- A basic understanding of REST APIs and how to make http requestes including setting headers
- A basic understanding of JWT (JSON Web Tokens) and how to sign them
- A secure way to store your private key and access them from your application (for example AWS secrets manager, or GGP secrets manager)


## Recommended tools

To manually make API requests and experiment with the API, we recommend using one of the following tools:

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [curlie](https://curlie.dev/)
- [httpie](https://httpie.io/)

To manually create or view and validate JWTs, we recommend using one of the following tools:

- [jwt.io](https://jwt.io/)
- [jwt-cli](https://github.com/jwt-cli/jwt)


## How to create a signing key pair

1. First generate the private keys (one for dev and one for prod) using the following command:
```bash
ssh-keygen -t rsa -b 4096 -m PEM -f dev-happypathology-jwtRS256.key
ssh-keygen -t rsa -b 4096 -m PEM -f prod-happypathology-jwtRS256.key
```

2. Then generate the public keys (one for dev and one for prod) using the following command:
```bash
openssl rsa -in dev-happypathology-jwtRS256.key -pubout -outform PEM -out dev-happypathology-jwtRS256.key.pub
openssl rsa -in prod-happypathology-jwtRS256.key -pubout -outform PEM -out prod-happypathology-jwtRS256.key.pub
```

3. Print the private key and public key to the console to visually verify that they look correct:
```bash
cat dev-happypathology-jwtRS256.key
cat dev-happypathology-jwtRS256.key.pub

cat prod-happypathology-jwtRS256.key
cat prod-happypathology-jwtRS256.key.pub
```

or copy them to clipboard safely (without changing the line breaks or whitespace) using the following command:
```bash
# on macOS on at a time
cat dev-happypathology-jwtRS256.key | pbcopy
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your DEV environment
cat dev-happypathology-jwtRS256.key.pub | pbcopy
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your DEV environment
cat prod-happypathology-jwtRS256.key | pbcopy
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your PROD environment
cat prod-happypathology-jwtRS256.key.pub | pbcopy
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your PROD environment

# on Linux
cat dev-happypathology-jwtRS256.key | xclip -selection clipboard
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your DEV environment
cat dev-happypathology-jwtRS256.key.pub | xclip -selection clipboard
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your DEV environment
cat prod-happypathology-jwtRS256.key | xclip -selection clipboard
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your PROD environment
cat prod-happypathology-jwtRS256.key.pub | xclip -selection clipboard
# now paste it to AWS Console secrets manager or Google Cloud secrets manager for your PROD environment
```

4. Store the private keys in a secure location (like paste it from the clipboard to AWS Console secrets manager or Google Cloud secrets manager)

5. Send the public keys to us via email or through the support chat.  As the name implies, the public key is public and does not need to be kept secret or treated as sensitive information.

## Sign a JWT

To sign a JWT, you will use your private key (for the corresponding environment, dev or prod).
It is best if you use a JWT library for your programming language of choice.
You can find a list of JWT libraries for your programming language of choice on the [JWT.io](https://jwt.io/libraries) website.

for exmple if you are using Go, you can use the [jwx](https://github.com/lestrrat-go/jwx) library.

```go
package examples_test

import (
  "bytes"
  "fmt"
  "net/http"
  "time"

  "github.com/lestrrat-go/jwx/v3/jwa"
  "github.com/lestrrat-go/jwx/v3/jwe"
  "github.com/lestrrat-go/jwx/v3/jwk"
  "github.com/lestrrat-go/jwx/v3/jws"
  "github.com/lestrrat-go/jwx/v3/jwt"
)

func Example() {
  // Parse, serialize, slice and dice JWKs!
  privkey, err := jwk.ParseKey(jsonRSAPrivateKey)
  if err != nil {
    fmt.Printf("failed to parse JWK: %s\n", err)
    return
  }

  pubkey, err := jwk.PublicKeyOf(privkey)
  if err != nil {
    fmt.Printf("failed to get public key: %s\n", err)
    return
  }

  // Work with JWTs!
  {
    // Build a JWT!
    tok, err := jwt.NewBuilder().
      Issuer(`github.com/lestrrat-go/jwx`).
      IssuedAt(time.Now()).
      Build()
    if err != nil {
      fmt.Printf("failed to build token: %s\n", err)
      return
    }

    // Sign a JWT!
    signed, err := jwt.Sign(tok, jwt.WithKey(jwa.RS256(), privkey))
    if err != nil {
      fmt.Printf("failed to sign token: %s\n", err)
      return
    }

    // Verify a JWT!
    {
      verifiedToken, err := jwt.Parse(signed, jwt.WithKey(jwa.RS256(), pubkey))
      if err != nil {
        fmt.Printf("failed to verify JWS: %s\n", err)
        return
      }
      _ = verifiedToken
    }

    // Work with *http.Request!
    {
      req, err := http.NewRequest(http.MethodGet, `https://github.com/lestrrat-go/jwx`, nil)
      req.Header.Set(`Authorization`, fmt.Sprintf(`Bearer %s`, signed))

      verifiedToken, err := jwt.ParseRequest(req, jwt.WithKey(jwa.RS256(), pubkey))
      if err != nil {
        fmt.Printf("failed to verify token from HTTP request: %s\n", err)
        return
      }
      _ = verifiedToken
    }
  }

  // Encrypt and Decrypt arbitrary payload with JWE!
  {
    encrypted, err := jwe.Encrypt(payloadLoremIpsum, jwe.WithKey(jwa.RSA_OAEP(), jwkRSAPublicKey))
    if err != nil {
      fmt.Printf("failed to encrypt payload: %s\n", err)
      return
    }

    decrypted, err := jwe.Decrypt(encrypted, jwe.WithKey(jwa.RSA_OAEP(), jwkRSAPrivateKey))
    if err != nil {
      fmt.Printf("failed to decrypt payload: %s\n", err)
      return
    }

    if !bytes.Equal(decrypted, payloadLoremIpsum) {
      fmt.Printf("verified payload did not match\n")
      return
    }
  }

  // Sign and Verify arbitrary payload with JWS!
  {
    signed, err := jws.Sign(payloadLoremIpsum, jws.WithKey(jwa.RS256(), jwkRSAPrivateKey))
    if err != nil {
      fmt.Printf("failed to sign payload: %s\n", err)
      return
    }

    verified, err := jws.Verify(signed, jws.WithKey(jwa.RS256(), jwkRSAPublicKey))
    if err != nil {
      fmt.Printf("failed to verify payload: %s\n", err)
      return
    }

    if !bytes.Equal(verified, payloadLoremIpsum) {
      fmt.Printf("verified payload did not match\n")
      return
    }
  }
  // OUTPUT:
}
```



## Authentication

All API requests require an Authorization header to be included in the request.
The Authorization header should be in the format `Bearer SIGNED_JWT`.

The SIGNED_JWT should be generated using the private key of the signing key pair.

Before you can make requests, you must have already shared your public key with us.



```bash
Authorization: Bearer SIGNED_JWT
```

## Making your first request

Here is a simple example to verify your connectivity:

```bash
curl https://api.happypathology.com/v1/health \
  -H "Authorization: Bearer YOUR_API_KEY"
```
