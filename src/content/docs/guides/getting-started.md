---
title: Getting Started
description: Learn how to start using the HappyPathology API.
---

Welcome to the HappyPathology API!

This guide will help you get up and running quickly.

## Prerequisites

Before you begin, you need:

- A signing key pair for your development and one for your production environment
- Have a basic understanding of REST APIs and how to make HTTP requests including setting headers
- A basic understanding of JWT (JSON Web Tokens) and how to sign them
- A secure way to store your private key and access them from your application


## Recommended tools

### Making HTTP calls
To manually make API requests and experiment with the API, we recommend using one of the following tools:

- Insomnia: [https://insomnia.rest/](https://insomnia.rest/)
- Bruno [https://www.usebruno.com/](https://www.usebruno.com/)
- Curlie [https://curlie.dev/](https://curlie.dev/)

#### Working with JWTs
To manually create or view and validate JWTs, we recommend using one of the following tools:

- JWT.io: [jwt.io](https://jwt.io/)

You also need to use a JWT library, you can find a list of them in any language you work in here:

- JWT Libraries: [https://www.jwt.io/libraries](https://www.jwt.io/libraries)

## How to create a signing key pair

1. First generate the private keys (one for dev and one for prod) using the following command:
```bash
# Generate Private keys

# For your dev environment
ssh-keygen -t rsa -b 4096 -m PEM -f dev-happypathology-jwtRS256.key -N ""

# For your prod environment
ssh-keygen -t rsa -b 4096 -m PEM -f prod-happypathology-jwtRS256.key -N ""
```

[!NOTE]
When asked to "Enter passphrase for ...", just press enter to skip it. DO NOT use a passphrase.


2. Then generate the public keys (one for dev and one for prod) using the following command:
```bash
# Generate Public keys

# For your dev environment
openssl rsa -in dev-happypathology-jwtRS256.key -pubout -outform PEM -out dev-happypathology-jwtRS256.key.pub

# For your prod environment
openssl rsa -in prod-happypathology-jwtRS256.key -pubout -outform PEM -out prod-happypathology-jwtRS256.key.pub
```

3. Print the private key and public key to the console to visually verify that they look correct:
```bash
# Print Private keys

# For your dev environment
cat dev-happypathology-jwtRS256.key

# For your prod environment
cat prod-happypathology-jwtRS256.key

# Print Public keys

# For your dev environment
cat dev-happypathology-jwtRS256.key.pub

# For your prod environment
cat prod-happypathology-jwtRS256.key.pub
```

or copy them to clipboard safely (without changing the line breaks or whitespace) using the following command:
```bash
# on macOS one at a time
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

[!WARNING]
Make sure to keep your private keys secure and never share them publicly, or commit them to your repo or store them in a database.
If you are using a cloud provider like AWS or Google Cloud, you can store the private keys in their secret manager service.
If you have to deploy your private key as a file in your application, make sure to set the file permissions to be readable only by the owner and make sure they are not in a directory that is publicly accessible or served by your web server.


5. Send the public keys to us via email or through the support chat.  As the name implies, the public key is public and does not need to be kept secret or treated as sensitive information.

[!NOTE]
It is completely okay to share the public key with us, and it is not a security risk. You can even share it publicly on your website or in your documentation.

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

For example, if you are using Go, you can use the [jwx](https://github.com/lestrrat-go/jwx) library.

```go
package main

import (
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwk"
	"github.com/lestrrat-go/jwx/jwt"
)

func main() {
	token := generateAuthToken()
	fmt.Println(token)
}

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

or in python

```python
# you can use this pyproject.toml file to install the required dependencies
# [project]
# name = "test-docs"
# version = "0.1.0"
# description = "Add your description here"
# readme = "README.md"
# requires-python = ">=3.12"
# dependencies = [
#     "PyJWT>=2.8.0",
#     "cryptography>=41.0.0",
# ]
#

import time
import datetime
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import jwt

def main():
    token = generate_auth_token()
    print(token)

def generate_auth_token():
    # Read the private key file
    with open("dev-happypathology-jwtRS256.key", "rb") as key_file:
        private_key_data = key_file.read()

    # Parse the private key
    private_key = serialization.load_pem_private_key(
        private_key_data,
        password=None,
        backend=default_backend()
    )

    # Create JWT claims
    issued = datetime.datetime.now(datetime.UTC)
    exp = issued + datetime.timedelta(hours=1)

    payload = {
        "aud": "api.happypathology.com",  # audience
        "exp": exp,                        # expiration time
        "iat": issued,                     # issued at
        "iss": "Your Organization ID",     # issuer
        "jti": str(time.time_ns()),        # JWT ID (nanoseconds timestamp)
        "sub": "Your User ID",             # subject
        "kid": "Your Key ID"               # key ID (custom claim)
    }

    # Sign the token with RS256 algorithm
    token = jwt.encode(
        payload,
        private_key,
        algorithm="RS256",
        headers={"kid": "Your Key ID"}  # kid is typically in the header
    )

    return token

if __name__ == "__main__":
    main()

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
The Authorization header should be in the format `Bearer YOUR_SIGNED_JWT`.

The SIGNED_JWT should be generated using the private key of the signing key pair.

Before you can make requests, you must have already shared your public key with us.

## Making your first authenticated request

Here is a simple example to verify your connectivity:

```bash
# first store your freshly signed token in a variable
export YOUR_SIGNED_TOKEN=$(python main.py)

# then use it in your request
# curlie
curlie POST https://dev.api.happypathology.com/auth/hello "Authorization:Bearer $YOUR_SIGNED_TOKEN"

# or using curl
curl -X POST https://dev.api.happypathology.com/auth/hello -H "Authorization:Bearer $YOUR_SIGNED_TOKEN"
```

You will see a response similar to the following:

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