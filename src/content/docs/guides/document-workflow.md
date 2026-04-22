---
title: Document Workflow
description: How to upload documents and retrieve extracted medical data.
---

HappyPathology processes images and extracts structured medical data from them.

The following file types may be uploaded:

- PDF: `application/pdf`
- JPEG: `image/jpeg`
- PNG: `image/png`


(PDF only) HappyPathology is able to detect if a pdf document contains multiple cases.
This feature requires the pdf document to include a specific HappyPathology separator page between each case. Please contact us to get a printable copy of the separator page.



## 4-Step Workflow

The HappyPathology workflow has four steps:

1. **Create a Source** — register the files you intend to upload. This will create a source and return a list of signed urls. Sources represent one or more files that will be processed.
2. **Upload the Files** — PUT each file directly to Google Cloud Storage using the source's signed urls from Step 1.
3. **Poll the Source** — wait for the source's contents to be ready for processing. When ready, this will return a list of case IDs.
4. **Retrieve Case Data** — poll each case id, until extraction is complete, and read the structured results.

---

### Step 1: Create a Source

Make a `POST` request to `/v1/source` with the list of files you want to upload.

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

Example usage using curl:


```bash
RESPONSE=$(curl -s -X POST https://api.happypathology.com/v1/source \
  -H "Authorization: Bearer $YOUR_SIGNED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"files":[{"content_type":"application/pdf","file_name":"PatientCases.pdf"}]}')

# Extract the source ID and first upload URL
SOURCE_ID=$(echo "$RESPONSE" | jq -r '.results.id')
UPLOAD_URL=$(echo "$RESPONSE" | jq -r '.results.upload_urls[0].url')

echo "Source ID: $SOURCE_ID"
echo "Upload URL: $UPLOAD_URL"
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
The signed upload URLs expire after five minutes.
:::


---

### Step 2: Upload the files

For each entry in `upload_urls`, PUT the corresponding file directly to Google Cloud Storage using the signed URL. This request goes to GCS — not to the HappyPathology API — so no `Authorization` header is needed.

Example usage using curl, if you captured `$UPLOAD_URL` in Step 1:

```bash
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --data-binary @PatientCases.pdf
```

Example usage using TypeScript:
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

### Step 3: Poll the source for case IDs

After uploading, poll `GET /v1/source/{SOURCE_ID}` periodically.

The response body will have a field named `results.status`.
Keep polling until `results.status` is `complete` or `failed`.

The `status` field moves through these values:

| Status | Meaning |
|---|---|
| `pending_upload` | Waiting for files to arrive in GCS |
| `processing` | Files received, extraction in progress |
| `complete` | All cases extracted, `case_ids` is populated |
| `failed` | Processing failed, you need to start over |


Example usage using curl:
```bash
curl https://api.happypathology.com/v1/source/$SOURCE_ID \
  -H "Authorization: Bearer $YOUR_SIGNED_TOKEN"
```


#### Example responses

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


**`failed`** - there was an internal error and processing failed. In this case, you need to start from step 1 again.

```json
{
    "status": 200,
    "results": {
        "id": "01KJDHXSC5B768KG1Q7BM54K4E",
        "status": "failed",
        "expected_file_count": 1,
        "uploaded_file_count": 1,
        "case_ids": null
    },
}
```

Once `status` is `"complete"`, store the case IDs and move on to Step 4:


Example usage using curl:

```bash
SOURCE_RESPONSE=$(curl -s https://api.happypathology.com/v1/source/$SOURCE_ID \
  -H "Authorization: Bearer $YOUR_SIGNED_TOKEN")

# Extract all case IDs as a JSON array
CASE_IDS=$(echo "$SOURCE_RESPONSE" | jq -r '.results.case_ids')

# Or extract a single case ID by index
CASE_ID=$(echo "$SOURCE_RESPONSE" | jq -r '.results.case_ids[0]')
```

---

### Step 4: Retrieve extracted case data

For each case ID, poll `GET /v1/patient_case/{CASE_ID}/extract` until the http response status is `200`.

While the case is being processed, the API returns http status `204 No Content` with an empty body.
Keep polling until you receive a http status `200 OK`.


Example usage using curl:
```bash
curl https://api.happypathology.com/v1/patient_case/$CASE_ID/extract \
  -H "Authorization: Bearer $YOUR_SIGNED_TOKEN"
```

When ready, the response contains the structured medical data under `results.medical_data`:

```json
{
    "status": 200,
    "results": {
        "status": "complete",
        "created_timestamp": 1774005780212133159,
        "updated_timestamp": 1774005849334733262,
        "id": "01KM5FQZMYKG2DA4FV2KPFXSZ2",
        "source_id": "01KM5FQY0ZTTT0JWTQEDTJPT89",
        "case_version": 1,
        "expiration_unix_time": 1776597778,
        "medical_data": {
            "01KM5FT37PKPMKMZD60FS4DQCM": {
                "patient_info": {
                    "document_printed_date": 1753481400,
                    "patient_dob": 799720810,
                    "patient_first_name": "jane",
                    "patient_last_name": "doe",
                    "patient_mrn": "1234567"
                },
                "medical_tests": [
                    {
                        "hematocrit": {
                            "value": 44.4,
                            "measurement_unit": "%",
                            "range": {
                                "min": 34.4,
                                "max": 44.2
                            }
                        },
                        "hemoglobin": {
                            "value": 14.6,
                            "measurement_unit": "g/dL",
                            "range": {
                                "min": 11.5,
                                "max": 15.1
                            }
                        },
                        "specimen_collection_date": 1753401600,
                        "specimen_ordering_physician": "caroline meehan, md",
                        "specimen_performing_lab": "massachusetts general hospital",
                        "specimen_reported_date": 1753401600,
                        "specimen_type": "blood",
                        "wbc_count": {
                            "value": 10.14,
                            "measurement_unit": "K/CUMM",
                            "range": {
                                "min": 3.5,
                                "max": 10.6
                            }
                        }
                    }
                ]
            }
        }
    },
    "debug_info": {
        "delta": "107.986194ms",
        "version": "happy_api.720.main.3244488"
    }
}
```


#### Extracted Data (medical_data)

When HappyPathology processes a case's files, it organizes the pages into distinct documents.
For example a document can be:
- a multipage cbc lab report from Dec 1, 2021.
- a multipage cbc lab report from Feb 2, 2026.
- a packet that contains patient medical history.
- an order form sent to the lab.

Each document is processed and HappyPathology returns the structured data under `medical_data`.

## Other Endpoints

### List All Sources

To get a list of all sources you have created (last 30 days), you can use  `GET /v1/sources/`

It accepts two optional query parameters:
- `limit`: The maximum number of sources to return.
- `next_token`: The token to use for pagination.

When you first call this endpoint, you should not provide a `next_token` or pass an empty string.
If there are more sources to fetch, the response will include a `next_token` field that you can use to fetch the next page of results.
If there is no `next_token` in the response, you have reached the end of the list.



```bash
curl -X GET "https://api.happypathology.com/v1/sources?limit=10&next_token=" \
  -H "Authorization: Bearer YOUR_API_KEY"
```


Example Response:
```json
{
    "status": 200,
    "results": {
        "next_token": "01KJZV8904W1B6A1AY3W63ET61",
        "sources": [
            {
                "id": "01KKRXDSDB7NPK0VJS3WDYJT0S",
                "original_file_names": {
                    "01KKRXDSDB7NPK0VJS3WDYJT0S/SOURCE_FILES/01KKRXDSDB7NPK0VJS3WDYJT0S_1": "Ali1Page.pdf"
                },
                "created_timestamp": 1773583918585688572,
                "account_id": "01JRPJC6DHSGTCKEEDS6XADCQK",
                "updated_timestamp": 1773583919805339208,
                "expiration_unix_time": 1776175918,
                "status": "complete",
                "expected_file_count": 1,
                "uploaded_file_count": 1,
                "case_ids": [
                    "01KKRXDTA2GV3WT9QDDY8KS86G"
                ]
            },
            // ... more sources
        ]
    },
    "debug_info": {
        "delta": "85.587215ms",
        "version": "happy_api.727.main.0ffa27d"
    }
}
```

:::caution
Sources are automatically deleted after 30 days.
:::


### Flattened Patient Case

To get all the extracted information for a Patient Case as one flat JSON object you can use `GET /v1/patient_case/{CASE_ID}/extract/flatten?tags=XYZ`

You can filter this information based on the tags on the documents.

You can provide zero, one or multiple tags by separating them with a comma, for example: `tags=XYZ,ABC`
When multiple tags are provided, documents that have ANY of the specified tags will be included in the flattened response.


Example usage using curl:
```bash
curl "https://api.happypathology.com/v1/patient_case/$CASE_ID/extract/flatten?tags=XYZ" \
  -H "Authorization: Bearer $YOUR_SIGNED_TOKEN"
```

When the case is ready, the response will be a flat JSON object containing all the extracted information. All values will be returned as objects structures like:

| values | is_confident |
|---|---|
| Array of extracted values | Boolean. `true` if the service has full confidence in ALL the extracted values. `false` if there is even a single value that has low confidence |



For example, if there are multiple patient medical record numbers (MRN) available in the document, all of them will be returned in an array for the key `patient_mrn`.


Example response:

```JSON
{
    "status": 200,
    "results": {
        "status": "complete",
        "created_timestamp": 1774005780212133159,
        "updated_timestamp": 1774005849334733262,
        "medical_data": {
            "id": "01KM5FQZMYKG2DA4FV2KPFXSZ2",
            "patient_first_name": {
                "values": [
                    "Richard",
                    "Rich"
                ],
                "is_confident": true
            },
            "patient_last_name": {
                "values": [
                    "Smith"
                ],
                "is_confident": true
            },
            "patient_id": {
                "values": [
                    "1234567"
                ],
                "is_confident": true
            },
            "hematocrit": {
                "values": [
                    {
                        "value": 44.4,
                        "measurement_unit": "%",
                        "range": {
                            "min": 34.4,
                            "max": 44.2
                        }
                    }
                ],
                "is_confident": true
            },
            "hemoglobin": {
                "values": [
                    {
                        "value": 14.6,
                        "measurement_unit": "g/dL",
                        "range": {
                            "min": 11.5,
                            "max": 15.1
                        }
                    }
                ],
                "is_confident": true
            },
            "specimen_collection_date": {
                "values": [
                    1753401600
                ],
                "is_confident": false
            },
            "specimen_ordering_physician": {
                "values": [
                    "coraline jones, md"
                ],
                "is_confident": true
            },
            "specimen_type": {
                "values": [
                    "blood",
                    "urine"
                ],
                "is_confident": true
            }
        }
    },
    "debug_info": {
        "delta": "107.986194ms",
        "version": "happy_api.720.main.3244488"
    }
}
```

### Flatten/Latest Patient Case

To get only the most recent values for each extracted field, you can use this endpoint `/api/v1/patient_case/{CASE_ID}/extract/flatten/latest`

This endpoint requires a `sets` query parameter to specify which sets of fields to include in the response.

The only supported set is: `CBC`

for example:

Example usage using curl:
```bash
curl "https://api.happypathology.com/v1/patient_case/$CASE_ID/extract/flatten/latest?sets=CBC" \
  -H "Authorization: Bearer $YOUR_SIGNED_TOKEN"
```

The shape of the response is exactly the same as the flatten endpoint, but with only the most recent values for each field included.

This api still can return multiple values for each field, since it is possible that there are multiple values available for a field with the same date.

An example response:
```JSON
{
    "status": 200,
    "results": {
        "status": "complete",
        "created_timestamp": 1774005780212133159,
        "updated_timestamp": 1774005849334733262,
        "medical_data": {
            "id": "01KM5FQZMYKG2DA4FV2KPFXSZ2",
            "patient_id": {
                "values": [
                    "1234567"
                ],
                "is_confident": true
            },
            "hematocrit": {
                "values": [
                    {
                        "value": 44.4,
                        "measurement_unit": "%",
                        "range": {
                            "min": 34.4,
                            "max": 44.2
                        }
                    }
                ],
                "is_confident": true
            },
            "hemoglobin": {
                "values": [
                    {
                        "value": 14.6,
                        "measurement_unit": "g/dL",
                        "range": {
                            "min": 11.5,
                            "max": 15.1
                        }
                    }
                ],
                "is_confident": true
            },
            "specimen_collection_date": {
                "values": [
                    1753401600
                ],
                "is_confident": false
            },
            "specimen_ordering_physician": {
                "values": [
                    "coraline jones, md"
                ],
                "is_confident": true
            },
            "specimen_type": {
                "values": [
                    "blood",
                    "urine"
                ],
                "is_confident": true
            }
        }
    },
    "debug_info": {
        "delta": "107.986194ms",
        "version": "happy_api.720.main.3244488"
    }
}
```


## Best Practices

All API calls are subject to rate limits and should be polled with appropriate backoff strategies.
The API will return a `429 Too Many Requests` status code if you exceed the rate limit.

We recommend limiting number of API calls to less than 10 per second.
