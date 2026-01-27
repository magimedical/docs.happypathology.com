---
title: Create Signing Key Pairs
description: How to create signing key pairs for authentication.
---

## How to create a signing key pair

1. First generate the private keys (one for dev and one for prod) using the following command:
```bash
# Generate Private keys

# For your dev environment
ssh-keygen -t rsa -b 4096 -m PEM -f dev-happypathology-jwtRS256.key -N ""

# For your prod environment
ssh-keygen -t rsa -b 4096 -m PEM -f prod-happypathology-jwtRS256.key -N ""
```

**Note**
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

**Warning**
Make sure to keep your private keys secure and never share them publicly, or commit them to your repo or store them in a database.
If you are using a cloud provider like AWS or Google Cloud, you can store the private keys in their secret manager service.
If you have to deploy your private key as a file in your application, make sure to set the file permissions to be readable only by the owner and make sure they are not in a directory that is publicly accessible or served by your web server.


5. Send the public keys to us via email or through the support chat.  As the name implies, the public key is public and does not need to be kept secret or treated as sensitive information.
