---
title: Health Check
description: How to check the API health status.
---

If you need to check the health status of the HappyPathology API you can make a GET call to the heartbeat endpoint.

```shell
# curlie
curlie https://api.happypathology.com/heartbeat

# curl
curl https://api.happypathology.com/heartbeat
```

```json
{
    "delta": "59.078µs",
    "heartbeat": "a7ef8fba741237f693c3",
    "request_timestamp": 1680716829,
    "version": "bb_api.331.develop.18ff645"
}
```
