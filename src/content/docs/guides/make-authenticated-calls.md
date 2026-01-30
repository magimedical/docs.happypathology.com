---
title: Make Authenticated Calls
description: How to make authenticated API calls.
---


## Making your first authenticated request

Here is a simple example to verify your connectivity:

```bash
# first store your freshly signed token in a variable
export YOUR_SIGNED_TOKEN=$(python main.py)

# then use it in your request
# curlie
curlie POST https://api.happypathology.com/auth/hello "Authorization:Bearer $YOUR_SIGNED_TOKEN"

# or using curl
curl -X POST https://api.happypathology.com/auth/hello -H "Authorization:Bearer $YOUR_SIGNED_TOKEN"
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
