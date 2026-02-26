---
title: Document Workflow
description: How to upload documents and retrieve extracted medical data.
---

Once you can make authenticated calls, the document workflow lets you upload patient case PDFs and retrieve structured medical data extracted from them.

The workflow has four steps:

1. **Create a source** — register the files you intend to upload and receive signed upload URLs
2. **Upload the files** — PUT each file directly to Google Cloud Storage
3. **Poll the source** — wait for processing to complete and collect the resulting case IDs
4. **Retrieve case data** — poll each case until extraction is complete and read the structured results

---

## Step 1: Create a source

Make a `POST` request to `/v1/source` with the list of files you want to upload.

```bash
# curlie
curlie POST https://api.happypathology.com/v1/source \
  "Authorization:Bearer $YOUR_SIGNED_TOKEN" \
  files:='[{"content_type":"application/pdf","file_name":"PatientCases.pdf"}]'

# or using curl
curl -X POST https://api.happypathology.com/v1/source \
  -H "Authorization: Bearer $YOUR_SIGNED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"files":[{"content_type":"application/pdf","file_name":"PatientCases.pdf"}]}'
```

The request body should look like this:

```json
{
  "files": [
    {
      "content_type": "application/pdf",
      "file_name": "PatientCases.pdf"
    }
  ]
}
```

The response contains two things you need to hold on to:

- **`results.id`** — the source ID, used in Steps 3 and 4
- **`results.upload_urls`** — one signed URL per file, used in Step 2

```json
{
    "status": 201,
    "results": {
        "id": "01KJDHXSC5B768KG1Q7BM54K4E",
        "upload_urls": [
            {
                "url": "https://storage.googleapis.com/...",
                "object_name": "images/01KJDHXSC5B768KG1Q7BM54K4E/SOURCE_FILES/01KJDHXSC5B768KG1Q7BM54K4E_1",
                "file_name": "PatientCases.pdf"
            }
        ]
    },
    "debug_info": {
        "delta": "102.707189ms",
        "version": "happy_api.549.main.02ec7cd"
    }
}
```

:::caution
The signed upload URLs expire after a few minutes. Proceed to Step 2 immediately.
:::

---

## Step 2: Upload the files

For each entry in `upload_urls`, PUT the corresponding file directly to Google Cloud Storage using the signed URL. This request goes to GCS — not to the HappyPathology API — so no `Authorization` header is needed.

```typescript
const uploadFileToGCS = async (
  signedUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`GCS upload failed for ${file.name}: ${response.status}`);
  }
};
```

A `200` response means the upload succeeded. If you receive any other status, retry the upload — use the same signed URL as long as it has not expired.

---

## Step 3: Poll the source for case IDs

After uploading, poll `GET /v1/source/{SOURCE_ID}` periodically until `results.status` is `"complete"`.

```bash
curlie https://api.happypathology.com/v1/source/01KJDHXSC5B768KG1Q7BM54K4E \
  "Authorization:Bearer $YOUR_SIGNED_TOKEN"
```

The `status` field moves through these values:

| Status | Meaning |
|---|---|
| `pending_upload` | Waiting for files to arrive in GCS |
| `processing` | Files received, extraction in progress |
| `complete` | All cases extracted, `case_ids` is populated |

**`pending_upload`** — no files have been received yet:

```json
{
    "status": 200,
    "results": {
        "id": "01KJDHXSC5B768KG1Q7BM54K4E",
        "status": "pending_upload",
        "expected_file_count": 1,
        "uploaded_file_count": 0,
        "case_ids": null
    }
}
```

**`processing`** — file received, cases being extracted:

```json
{
    "status": 200,
    "results": {
        "id": "01KJDHXSC5B768KG1Q7BM54K4E",
        "status": "processing",
        "expected_file_count": 1,
        "uploaded_file_count": 1,
        "case_ids": null
    }
}
```

**`complete`** — extraction finished, `case_ids` is ready:

```json
{
    "status": 200,
    "results": {
        "id": "01KJDHXSC5B768KG1Q7BM54K4E",
        "status": "complete",
        "expected_file_count": 1,
        "uploaded_file_count": 1,
        "case_ids": [
            "01KJDHYF3GR99Y7CDGC27K1EGP",
            "01KJDHYF3WD12JXYC26BYQKNY8",
            "01KJDHYF48C7F1QKS4YE3Y2QV0"
        ]
    }
}
```

Once `status` is `"complete"`, collect the `case_ids` array and move on to Step 4.

---

## Step 4: Retrieve extracted case data

For each case ID, poll `GET /v1/patient_case/{CASE_ID}/extract` until the response status is `200`.

```bash
curlie https://api.happypathology.com/v1/patient_case/01KJDHYF3GR99Y7CDGC27K1EGP/extract \
  "Authorization:Bearer $YOUR_SIGNED_TOKEN"
```

While the case is still being processed, the API returns `204 No Content` with an empty body. Keep polling until you receive a `200`.

When ready, the response contains the structured medical data under `results.medical_data`:

```json
{
    "status": 200,
    "results": {
        "status": "complete",
        "id": "01KJDHYF3GR99Y7CDGC27K1EGP",
        "source_id": "01KJDHXSC5B768KG1Q7BM54K4E",
        "case_name": "Patient 8239534 Ali Moeeny DOB:7/20/1978",
        "medical_data": [
            {},
            {
                "patient_first_name": "Ali",
                "patient_last_name": "Moeeny",
                "patient_mrn": "8239534",
                "patient_dob": "7/20/1978",
                "wbc_count": {
                    "value": 10.14,
                    "measurement_unit": "K/uL",
                    "range": { "min": 4, "max": 11 }
                },
                "hemoglobin": {
                    "value": 14.6,
                    "measurement_unit": "g/dL",
                    "range": { "min": 13.5, "max": 17.5 }
                }
            }
        ]
    },
    "debug_info": {
        "delta": "1.007220824s",
        "version": "happy_api.549.main.02ec7cd"
    }
}
```

Each entry in `medical_data` corresponds to one CBC panel extracted from the source document. Patient demographics (`patient_first_name`, `patient_last_name`, `patient_mrn`, `patient_dob`) and all CBC markers are included alongside their reference ranges.
