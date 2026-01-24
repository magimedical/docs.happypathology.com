---
title: Signing JWTs
description: How to sign JSON Web Tokens for API authentication.
---



## Sign a JWT

To sign a JWT aka Auth token, you need the following information:

### Required Information

**You create these yourself:**
- Your **Private Key** (for the corresponding environment, dev or prod)

**We provide you with:**
- Your **Organization ID** (you will receive this when you share your public key with us)
- Your **Key ID** (you will receive this when you share your public key with us)
- **Audience** (api.happypathology.com) on both dev and prod environments it is the same

**User information:**
- **User ID** (you can use any string that identifies the user)

**Token settings:**
- **Expiration time** (you can set it to 1 hour or less)
- **Issued at** (current time)



To sign a JWT, you will use your private key (for the corresponding environment, dev or prod).
It is best if you use a JWT library for your programming language of choice.
You can find a list of JWT libraries for your programming language of choice on the [JWT.io](https://jwt.io/libraries) website.


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
    // assuming the private key is stored in a file called "dev-happypathology-jwtRS256.key" in the current directory
	_PRIVATE_KEY_, err := ioutil.ReadFile("dev-happypathology-jwtRS256.key")
	if err != nil {
		log.Fatalf("failed to read private key: %v", err)
	}

	// create a new jwt
	issued := time.Now()
	exp := time.Now().Add(time.Hour)
	j := jwt.NewBuilder()
	j.Audience([]string{"api.happypathology.com"})
	j.Expiration(exp)
	j.IssuedAt(issued)
	j.Issuer("<REPLACE THIS WITH THE ORGANIZATION ID WE PROVIDED YOU>")
	j.JwtID(fmt.Sprintf("%d", time.Now().UnixNano()))
	j.Subject("THIS IS A USER ID OF YOUR CHOICE")
	j.Claim("kid", "<REPLACE THIS WITH THE KEY ID WE PROVIDED YOU>")

	token, err := j.Build()
	if err != nil {
		log.Fatalf("failed to build token: %v", err)
	}
	block, _ := pem.Decode(_PRIVATE_KEY_)
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		log.Fatalf("failed to parse private key: %v", err)
	}

	kk, err := jwk.New(key)
	if err != nil {
		log.Fatalf("failed to create jwk: %v", err)
	}
	signedT, err := jwt.Sign(token, jwa.RS256, kk)
	if err != nil {
		log.Fatalf("failed to sign token: %v", err)
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
    # assuming the private key is stored in a file called "dev-happypathology-jwtRS256.key" in the current directory
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
        "iss": "REPLACE THIS WITH THE ORGANIZATION ID WE PROVIDED YOU",     # issuer
        "jti": str(time.time_ns()),        # JWT ID (nanoseconds timestamp)
        "sub": "REPLACE THIS WITH A USER ID OF YOUR CHOICE",             # subject
        "kid": "REPLACE THIS WITH THE KEY ID WE PROVIDED YOU"               # key ID (custom claim)
    }

    # Sign the token with RS256 algorithm
    token = jwt.encode(
        payload,
        private_key,
        algorithm="RS256",
    )

    return token

if __name__ == "__main__":
    main()

```
