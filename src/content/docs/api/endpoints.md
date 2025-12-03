---
title: Endpoints
description: Detailed reference for API endpoints.
---

## Patients

### Get all patients

Returns a list of your patients.

```http
GET /patients
```

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `limit` | `integer` | A limit on the number of objects to be returned. Limit can range between 1 and 100. |
| `page` | `integer` | The page number to retrieve. |

#### Response

```json
{
  "data": [
    {
      "id": "pat_123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "has_more": false
}
```

### Create a patient

Creates a new patient object.

```http
POST /patients
```

#### Body Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | The full name of the patient. |
| `email` | `string` | Yes | The email address of the patient. |
