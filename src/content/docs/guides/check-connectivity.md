---
title: Check Connectivity
description: Verify your connection to the HappyPathology API.
---


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

