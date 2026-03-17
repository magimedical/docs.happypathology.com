---
title: Data Models
description: The shape of every object returned by the HappyPathology API.
---

This page describes the structure of every object returned by the HappyPathology API.

---

## Basic Data Types

### Timestamps

All dates in the Medical Document are represented as Unix (UTC) timestamps.
```
"date_of_birth": 1772581386
```

Operational timestamps, like `created_timestamp` and `updated_timestamp`, are represented as Unix Nanoseconds (UTC).

```
"created_timestamp": 1772581386000000000
"updated_timestamp": 1772581386000000000
```


### Status Codes

The API uses standard HTTP status codes for errors. The `status` field in the response envelope mirrors the HTTP status code.

---

## API Response Envelope

Every response from the API wraps its payload in the same envelope:

| Field | Type | Description |
|---|---|---|
| `status` | `number` | HTTP status code mirrored in the body |
| `results` | `object` | The response payload (shape varies by endpoint) |
| `debug_info.delta` | `string` | Server-side request duration |
| `debug_info.version` | `string` | API build version |

```json
{
    "status": 200,
    "results": { },
    "debug_info": {
        "delta": "102.707189ms",
        "version": "happy_api.549.main.02ec7cd"
    }
}
```

---

## Upload URL

Returned inside `results.upload_urls` when creating a source. Each entry corresponds to one file.

| Field | Type | Description |
|---|---|---|
| `url` | `string` | Signed GCS URL — PUT your file here directly |
| `file_name` | `string` | The original file name you provided |

```json
{
    "url": "https://storage.googleapis.com/...",
    "file_name": "PatientCases.pdf"
}
```

:::caution
Upload URLs expire after five minutes.
:::

---

## Source

Represents a batch of uploaded files being processed into cases.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Source ID — reference this when polling status and in Step 4 |
| `status` | `string` | Current processing state (this is NOT the http status code) |
| `expected_file_count` | `number` | Number of files declared when the source was created |
| `uploaded_file_count` | `number` | Number of files received so far |
| `case_ids` | `string[]` or `null` | IDs of extracted cases — populated when `status` is `complete` |
| `created_timestamp` | `number` | Unix nanoseconds |
| `updated_timestamp` | `number` | Unix nanoseconds |
| `account_id` | `string` | Your account ID |


:::caution
A Source can have a maximum of 100 cases.
:::

### Source status

| Value | Meaning |
|---|---|
| `pending_upload` | Waiting for files to arrive |
| `processing` | Files received, cases being extracted |
| `complete` | Extraction done — `case_ids` is populated |
| `failed` | Processing failed, you need to start over |

---

## Patient Case

Represents a single patient's case extracted from a source document. One source can produce multiple cases.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Case ID |
| `source_id` | `string` | The source this case was extracted from |
| `account_id` | `string` | Your account ID |
| `status` | `string` | Current processing state (this is NOT the http status code) |
| `created_timestamp` | `number` | Unix nanoseconds |
| `updated_timestamp` | `number` | Unix nanoseconds |

The full case contents, including extracted medical data, are returned by the `/v1/patient_case/{CASE_ID}/extract` endpoint under `results.medical_data`.

---

## Medical Document

The following is a list of all available fields that HappyPathology can extract from a document.

For each field the values can be in either of the following formats:

- `string`
- `number` (this is always an int64)
- `Array<string>`
- Medical Test format `{ "value" : number , "measurement_unit" : string, "range" : { "min" : number, "max" : number }}`



### Patient Information

| Field | Type | Description |
|---|---|---|
| `patient_first_name` | `string` | |
| `patient_last_name` | `string` | |
| `patient_middle_name` | `string` | |
| `patient_suffix` | `string` | |
| `patient_mrn` | `string` | Medical record number |
| `patient_id` | `string` | This is not MRN, this is other patient identifiers often assigned by the lab |
| `patient_dob` | `number` | Unix timestamp (see [Timestamps](#timestamps)) |
| `patient_ssn` | `string` | Social Security Number or a subset of it |
| `patient_sex` | `string` | |
| `patient_gender` | `string` | |
| `patient_address_1` | `string` | |
| `patient_address_2` | `string` | |
| `patient_city` | `string` | |
| `patient_state` | `string` | |
| `patient_zip` | `string` | |
| `patient_country` | `string` | |
| `patient_phone_home` | `string` | |
| `patient_phone_mobile` | `string` | |

### Patient Clinical Data

| Field | Type | Description |
| - |- |-|
| `patient_clinical_data` | `string` | |
| `patient_icd10_codes` | `Array<string>` | |

### Specimen Information

| Field | Type | Description |
| - |- |-|
| `specimen_id` | `string` | |
| `specimen_type` | `Array<string>` | |
| `specimen_ordering_facility` | `string` | |
| `specimen_ordering_physician` | `string` | |
| `specimen_performing_lab` | `string` | |
| `specimen_collection_date` | `number` | Unix seconds (see [Timestamps](#timestamps)) |
| `specimen_received_date` | `number` | Unix seconds (see [Timestamps](#timestamps)) |
| `specimen_reported_date` | `number` | Unix seconds (see [Timestamps](#timestamps)) |
| `document_printed_date` | `number` | Unix seconds (see [Timestamps](#timestamps)) |

### Medical Tests

| Field | Type | Description |
| - |- |-|
| `rbc_count` | `medical_test_format` | |
| `wbc_count` | `medical_test_format` | |
| `hemoglobin` | `medical_test_format` | |
| `hematocrit` | `medical_test_format` | |
| `mcv` | `medical_test_format` | |
| `mch` | `medical_test_format` | |
| `mchc` | `medical_test_format` | |
| `rdw` | `medical_test_format` | |
| `platelet_count` | `medical_test_format` | |
| `mpv` | `medical_test_format` | |
| `neutrophils_percent` | `medical_test_format` | |
| `lymphocytes_percent` | `medical_test_format` | |
| `monocytes_percent` | `medical_test_format` | |
| `eosinophils_percent` | `medical_test_format` | |
| `basophils_percent` | `medical_test_format` | |
| `absolute_neutrophil` | `medical_test_format` | |
| `absolute_lymphocyte` | `medical_test_format` | |
| `absolute_monocyte` | `medical_test_format` | |
| `absolute_eosinophil` | `medical_test_format` | |
| `absolute_basophil` | `medical_test_format` | |
| `immature_granulocyte_percent` | `medical_test_format` | |
| `absolute_immature_granulocyte` | `medical_test_format` | |
| `nrbc_count` | `medical_test_format` | |
| `blast_cell_percent` | `medical_test_format` | |
| `promyelocytes_percent` | `medical_test_format` | |
| `absolute_promyelocytes` | `medical_test_format` | |
| `myelocytes_percent` | `medical_test_format` | |
| `absolute_myelocytes` | `medical_test_format` | |
| `metamyelocytes_percent` | `medical_test_format` | |
| `absolute_metamyelocytes` | `medical_test_format` | |
| `bands_percent` | `medical_test_format` | |
| `absolute_bands` | `medical_test_format` | |
| `segmented_neutrophils_percent` | `medical_test_format` | |
| `reticulocytes_percent` | `medical_test_format` | |
| `absolute_reticulocytes` | `medical_test_format` | |
| `immature_reticulocyte_fraction_percent` | `medical_test_format` | |
| `atypical_lymphocytes_percent` | `medical_test_format` | |
| `absolute_atypical_lymphocytes` | `medical_test_format` | |
| `plasma_cell_count` | `medical_test_format` | |
| `normoblasts_percent` | `medical_test_format` | |
| `unclassified_cells_percent` | `medical_test_format` | |
| `absolute_unclassified_cells` | `medical_test_format` | |

### Document Metadata

| Field | Type | Description |
| - |- |-|
| `document_tag` | `Array<string>` | |

### Precipio Requisition Form

| Field | Type | Description |
| - |- |-|
| `precipio_patient_next_appointment_datetime` | `number` | Unix seconds (see [Timestamps](#timestamps)) |
| `precipio_patient_clinical_status` | `string` | |
| `precipio_patient_clinical_indications` | `Array<string>` | |
| `precipio_copy_physician_name` | `string` | |
| `precipio_tests_requested` | `Array<string>` | |
| `precipio_test_id` | `string` | |





| Field | Typical unit |
|---|---|
| `wbc_count` | K/uL |
| `rbc_count` | M/uL |
| `hemoglobin` | g/dL |
| `hematocrit` | % |
| `mcv` | fL |
| `mch` | pg |
| `mchc` | g/dL |
| `rdw` | % |
| `platelet_count` | K/uL |
| `mpv` | fL |
| `neutrophils_percent` | % |
| `absolute_neutrophil` | K/uL |
| `lymphocytes_percent` | % |
| `absolute_lymphocyte` | K/uL |
| `monocytes_percent` | % |
| `absolute_monocyte` | K/uL |
| `eosinophils_percent` | % |
| `absolute_eosinophil` | K/uL |
| `basophils_percent` | % |
| `absolute_basophil` | K/uL |
| `immature_granulocyte_percent` | % |
| `absolute_immature_granulocyte` | K/uL |
| `nrbc_count` | K/uL |

---

## Lab Result

The shape used for every CBC marker value.

| Field | Type | Description |
|---|---|---|
| `value` | `number` | Measured value |
| `measurement_unit` | `string` | Unit of measurement, e.g. `"K/uL"`, `"g/dL"`, `"%"` |
| `range.min` | `number` | Lower bound of the reference range |
| `range.max` | `number` | Upper bound of the reference range |

```json
{
    "value": 10.14,
    "measurement_unit": "K/uL",
    "range": {
        "min": 4,
        "max": 11
    }
}
```
