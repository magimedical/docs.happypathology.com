---
title: Create Signing Key Pairs
description: How to create signing key pairs for authentication.
---

## How to create a signing key pair

1. First generate a private key using the following command:
```bash
# Generate Private key

ssh-keygen -t rsa -b 4096 -m PEM -f happypathology-jwtRS256.key -N ""
```

**Note**
When asked to "Enter passphrase for ...", just press enter to skip it. DO NOT use a passphrase.


2. Then generate a public key using the following command:
```bash
# Generate Public key

openssl rsa -in happypathology-jwtRS256.key -pubout -outform PEM -out happypathology-jwtRS256.key.pub
```

3. Print the private key and public key to the console to visually verify that they look correct:
```bash
# Print Private key

cat happypathology-jwtRS256.key

# Print Public key

cat happypathology-jwtRS256.key.pub
```


4. Store the private keys in a secure location (like paste it from the clipboard to AWS Console secrets manager or Google Cloud secrets manager)

**Warning**
Make sure to keep your private keys secure and never share them publicly, or commit them to your repo or store them in a database.
If you are using a cloud provider like AWS or Google Cloud, you can store the private keys in their secret manager service.
If you have to deploy your private key as a file in your application, make sure to set the file permissions to be readable only by the owner and make sure they are not in a directory that is publicly accessible or served by your web server.

It is important to make sure the whitespaces do not change during this process. You can use the following commands to copy the private key to clipboard safely (without changing the line breaks or whitespace):
```bash
# on macOS
cat happypathology-jwtRS256.key | pbcopy
# now paste your private key to AWS Console secrets manager or Google Cloud secrets manager


# or on Linux
cat happypathology-jwtRS256.key | xclip -selection clipboard
# now paste your private key to AWS Console secrets manager or Google Cloud secrets manager

```


5. Send the public keys to us via email or through the support chat.  As the name implies, the public key is public and does not need to be kept secret or treated as sensitive information.

```bash
# on macos
cat happypathology-jwtRS256.key.pub | pbcopy
# send your public key to your happy pathology contact's email

# or on Linux
cat happypathology-jwtRS256.key.pub | xclip -selection clipboard
# send you public key to your happy pathology contact's email
```