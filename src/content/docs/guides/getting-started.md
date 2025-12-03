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

- [Insomnia](https://insomnia.rest/)
- [curlie](https://curlie.dev/)

To manually create or view and validate JWTs, we recommend using one of the following tools:

- [jwt.io](https://jwt.io/)


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

To sign the JWT you need:
1. your private key (see above)
2. your organization ID (you will receive this when you share your public key with us)
3. your user ID (you will receive this when you share your public key with us)
4. your key ID (you will receive this when you share your public key with us)
5. audience (api.happypathology.com)
6. expiration time (you can set it to 1 hour or less)
7. issued at (current time)

for exmple if you are using Go, you can use the [jwx](https://github.com/lestrrat-go/jwx) library.

```go
package main

import (
    "crypto/x509"
    "encoding/pem"
    "fmt"
    "io/ioutil"
    "log"
    "math/rand"
    "os"
    "time"

    "github.com/lestrrat-go/jwx/jwa"
    "github.com/lestrrat-go/jwx/jwk"
    "github.com/lestrrat-go/jwx/jwt"
)

// V1 example
func generateAuthToken() string {
    _PRIVATE_KEY_, err := ioutil.ReadFile("dev-happypathology-jwtRS256.key")
    if err != nil {
        log.Fatal(err)
    }

    // create a new jwt
    issued := time.Now()
    exp := time.Now().Add(time.Hour)
    j := jwt.NewBuilder()
    j.Audience([]string{"api.happypathology.com"})
    j.Expiration(exp)
    j.IssuedAt(issued)
    j.Issuer("Your Organization ID")
    j.JwtID(fmt.Sprintf("%d", time.Now().UnixNano()))
    j.Subject("Your User ID")
    j.Claim("kid", "Your Key ID")

    token, err := j.Build()
    if err != nil {
        log.Fatal(err)
    }
    block, _ := pem.Decode(_PRIVATE_KEY_)
    key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
    if err != nil {
        log.Fatalf("%v", err)
    }

    kk, err := jwk.New(key)
    if err != nil {
        log.Fatal(err)
    }
    signedT, err := jwt.Sign(token, jwa.RS256, kk)
    if err != nil {
        log.Fatal(err)
    }
    return string(signedT)
}
```


## Connectivity

To verify your connectivity, you can make a GET request to the `/heartbeat` endpoint.

```bash
# dev
# using curlie
curlie https://dev.api.happypathology.com/heartbeat
# or using curl
curl https://dev.api.happypathology.com/heartbeat


# prod
# using curlie
curlie https://api.happypathology.com/heartbeat
# or using curl
curl https://api.happypathology.com/heartbeat
```

You will see a response similar to the following:

```json
{
    "status": 200,
    "results": {
        "delta": "30.603047ms",
        "heartbeat": "636483da28d5f7b0f701",
        "request_timestamp": 1764725619,
        "status": 200,
        "user-agent": "curl/8.7.1",
        "version": "happy_api.386.explicit-impersonation-request-check.f6b326f"
    },
    "debug_info": {
        "delta": "30.643443ms",
        "version": "happy_api.386.explicit-impersonation-request-check.f6b326f"
    }
}
```

This is the shape of all responses from the API that return a json response.


## Authentication

All authenticated API requests require an Authorization header to be included in the request.
The Authorization header should be in the format `Bearer SIGNED_JWT`.

The SIGNED_JWT should be generated using the private key of the signing key pair.

Before you can make requests, you must have already shared your public key with us.

## Making your first authenticated request

Here is a simple example to verify your connectivity:

```bash
# curlie
curlie POST https://dev.api.happypathology.com/auth/hello "Authorization:Bearer eyJhbGciOiJS ...."
# curl
curl https://api.happypathology.com/v1/auth/hello -H "Authorization:Bearer SIGNED_JWT"
```

```json
{
    "status": 200,
    "results": {
        "auth_info": "Hello there!"
    },
    "debug_info": {
        "delta": "54.156211ms",
        "version": "happy_api.386.explicit-impersonation-request-check.f6b326f"
    }
}
```