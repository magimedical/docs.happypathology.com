---
title: HTTP Responses
description: Understanding HappyPathology API responses.
---

The HappyPathology API typically returns responses in JSON format. The standard response structure is as follows:

```json
{
  "status": 202,
  "results": {
    // The main output of the API call
  },
  "error": "Error message, if applicable",
  "user_message": "",
  "debug_info": {
    // Helpful information for debugging
  }
}
```

## Response Fields

| Field | Description |
| :--- | :--- |
| `status` | An integer representing the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of the response. |
| `results` | The main output of the API call. This field can contain various data types, often a JSON object. |
| `error` | A string providing error details, including error codes or context, when applicable. |
| `user_message` | A human-readable message suitable for display to end users, particularly useful in error scenarios. |
| `debug_info` | An object containing additional information to assist with troubleshooting. Note: Authentication debugging information is handled separately (see Auth section). |

## Status Codes

The `status` field in the response corresponds to standard HTTP status codes. Common codes you may encounter include:

-   **200: OK** - The request was successful
-   **201: Created** - A new resource was successfully created
-   **202: Accepted** - The request has been accepted for processing
-   **400: Bad Request** - The request was invalid or cannot be processed as is
-   **401: Unauthorized** - Authentication is required and has failed or has not been provided
-   **403: Forbidden** - The server understood the request but refuses to authorize it
-   **404: Not Found** - The requested resource could not be found
-   **500: Internal Server Error** - The server encountered an unexpected condition

## Error Handling

When an error occurs, the `error` field will contain a descriptive message to help diagnose the issue. The `user_message` field may provide a more user-friendly explanation of the error, which can be directly displayed in your application's user interface.

## Debugging

The `debug_info` object contains additional technical details that can be valuable for troubleshooting issues with your API integration. This information is primarily intended for developers and should not be displayed to end users.

> **Note**: For security reasons, authentication-related debugging information is handled separately. Please refer to the Auth section of this documentation for details on debugging authentication issues.

> **Note**: The `debug_info` object is optional and may not be present in all responses. It may contain different fields depending on the endpoint and other factors.
