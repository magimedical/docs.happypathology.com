---
title: Auth Model
description: Understanding the HappyPathology authentication model.
---

## Authentication

All authenticated API requests require an Authorization header to be included in the request.
The Authorization header should be in the format `Bearer YOUR_SIGNED_JWT`.

The SIGNED_JWT should be generated using the private key of the signing key pair.

Before you can make requests, you must have already shared your public key with us.

**Note:** The maximum validity of a signed JWT is 1 hour. It is generally recommended to sign a new JWT for each request.
