---
title: API Introduction
description: Overview of the HappyPathology API.
---

The HappyPathology API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

## Base URL

All URLs referenced in the documentation have the following base:

```
https://api.happypathology.com/v1
```

## Errors

HappyPathology uses conventional HTTP response codes to indicate the success or failure of an API request.

- Codes in the `2xx` range indicate success.
- Codes in the `4xx` range indicate an error that failed given the information provided (e.g., a required parameter was omitted, a charge failed, etc.).
- Codes in the `5xx` range indicate an error with HappyPathology's servers.
