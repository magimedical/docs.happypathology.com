---
title: Verifying JWTs
description: How to verify JSON Web Tokens from the API.
---

The easiest way to verify and inspect your JWTs is to use [jwt.io](https://jwt.io/).

Simply copy your JWT token and paste it into the decoder on jwt.io to verify its contents.

To verify the signature you need to also paste your **public key** into the "Verify signature" section on jwt.io.


If you want to make sure your key is acceptable to the HappyPathology API, you can make a request to `/auth/hello` as explained in the [Make Authenticated Calls](/guides/make-authenticated-calls/) guide.


