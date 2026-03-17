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
"date_of_birth": "1772581386"
```

Operational timestamps, like `created_timestamp` and `updated_timestamp`, are also represented as Unix Nanoseconds (UTC).

```
"created_timestamp": "1772581386000000000"
"updated_timestamp": "1772581386000000000"
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
- Medical Test of format `{ "value" : number , "measurement_unit" : string, "range" : { "min" : number, "max" : number }}`


:::caution
This list is work in progress and is not comprehensive.
:::


| Field | Type | Description |
|---|---|---|
| `patient_first_name` | `string` | |
| `patient_last_name` | `string` | |
| `patient_middle_name` | `string` | |
| `patient_suffix` | `string` | |
| `patient_mrn` | `string` | Medical record number |
| `patient_id` | `string` | This is not MRN, this is other patient identifiers often assigned by the lab |
| `patient_dob` | `string` | Date of birth, e.g. `"1/2/2026"` |
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
| - |- |-|
| `patient_clincal_data` | `string` | |
| `patient_icd10_codes` | `string` | |
| - |- |-|
| `specimen_id` | `string` | |
| `specimen_type` | `string` | |
| `specimen_reported_date` | `number` | Unix seconds |
| `specimen_ordering_facility` | `string` | |
| `specimen_ordering_physician` | `string` | |
| `specimen_performing_lab` | `string` | |
| `specimen_collection_date` | `number` | Unix seconds |
| `specimen_received_date` | `number` | Unix seconds |
| `specimen_reported_date` | `number` | Unix seconds |
| `document_printed_date` | `number` | Unix seconds |
| - |- |-|
| `rbc_count` | `number` | |
| `wbc_count` | `number` | |
| `hemoglobin` | `number` | |
| `hematocrit` | `number` | |
| `mcv` | `number` | |
| `mch` | `number` | |
| `mchc` | `number` | |
| `rdw` | `number` | |
| `platelet_count` | `number` | |
| `mpv` | `number` | |
| `neutrophils_percent` | `number` | |
| `lymphocytes_percent` | `number` | |
| `monocytes_percent` | `number` | |
| `eosinophils_percent` | `number` | |
| `basophils_percent` | `number` | |
| `absolute_neutrophil` | `number` | |
| `absolute_lymphocyte` | `number` | |
| `absolute_monocyte` | `number` | |
| `absolute_eosinophil` | `number` | |
| `absolute_basophil` | `number` | |
| `immature_granulocyte_percent` | `number` | |
| `absolute_immature_granulocyte` | `number` | |
| `nrbc_count` | `number` | |
| `blast_cell_percent` | `number` | |
| `promyelocytes_percent` | `number` | |
| `absolute_promyelocytes` | `number` | |
| `myelocytes_percent` | `number` | |
| `absolute_myelocytes` | `number` | |
| `metamyelocytes_percent` | `number` | |
| `absolute_metamyelocytes` | `number` | |
| `bands_percent` | `number` | |
| `absolute_bands` | `number` | |
| `segmented_neutrophils_percent` | `number` | |
| `reticulocytes_percent` | `number` | |
| `absolute_reticulocytes` | `number` | |
| `immature_reticulocyte_fraction_percent` | `number` | |
| `atypical_lymphocytes_percent` | `number` | |
| `absolute_atypical_lymphocytes` | `number` | |
| `plasma_cell_count` | `number` | |
| `normoblasts_percent` | `number` | |
| `unclassified_cells_percent` | `number` | |
| `absolute_unclassified_cells` | `number` | |
| - |- |-|
| `document_tag` | `string` |
| - |- |-|
| `precipio_patient_next_appointment_datetime` | `number` | Unix seconds |
| `precipio_patient_clinical_status` | `string` | |
| `precipio_patient_clinical_indications` | `string` | |
| `precipio_copy_physician_name` | `string` | |
| `precipio_tests_requested` | `string` | |
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
