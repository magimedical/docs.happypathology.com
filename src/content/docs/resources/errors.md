---
title: Errors
description: Reference for API error codes.
---

The HappyPathology API uses the following error codes:

| Error Code | Meaning |
| :--- | :--- |
| 400 | **Bad Request** -- Your request is invalid. |
| 401 | **Unauthorized** -- Your API key is not correctly signed or expired. |
| 403 | **Forbidden** -- Your token does not grant you permission to perform this task. |
| 404 | **Not Found** -- The specified resource could not be found. |
| 405 | **Method Not Allowed** -- You tried to access a resource with an invalid method. |
| 406 | **Not Acceptable** -- You requested a format that isn't json. |
| 418 | **I'm a teapot.** (for debugging purposes) |
| 429 | **Too Many Requests** -- You're being throttled |
| 500 | **Internal Server Error** -- Our apologies, We had a problem with our server. Please try again later. |
| 503 | **Service Unavailable** -- Our apologies, We're temporarily offline. Please try again later. |
