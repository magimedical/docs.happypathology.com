---
title: Data Models
description: The shape of every object returned by the HappyPathology API.
---

This page describes the structure of every object returned by the HappyPathology API.

---

## Basic Data Types

### Timestamps

All dates in the Medical Document are represented as Unix (UTC) timestamps.
Some are in Seconds, some are in Nanoseconds. Please reference the individual field's documentation.

For Example:

Unix Seconds (UTC)

```
"date_of_birth": 1772581386
```

Unix Nanoseconds (UTC)

```
"created_timestamp": 1772581386000000000
"updated_timestamp": 1772581386000000000
```


### Status Codes

The API uses standard HTTP status codes for errors.

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
| `status` | `string` | Current processing state (this is NOT the http status code) — see [Source Status](#source-status) |
| `expected_file_count` | `number` | Number of files declared when the source was created |
| `uploaded_file_count` | `number` | Number of files received so far |
| `case_ids` | `string[]` or `null` | IDs of extracted cases — populated when `status` is `complete` |
| `created_timestamp` | `number` | When this source was originally created (Unix nanoseconds) |
| `updated_timestamp` | `number` | When this source record was last modified (Unix nanoseconds) |
| `account_id` | `string` | Your account ID |
| `expiration_unix_time` | `number` | When this source and all related data will be deleted (Unix Seconds) |
| `original_file_names` | `map[string]string` | A map of the received files' filenames to their internal HappyPathology filepath |


:::caution
A Source can have a maximum of 100 cases.
:::

### Source status

| Value | Meaning |
|---|---|
| `pending_upload` | Waiting for files to arrive |
| `processing` | Files received, source is being created |
| `complete` | Source created — `case_ids` is returned in the response |
| `failed` | Source processing failed. You will need to start over from the beginning (create a new source) |

---


## Patient Case

Represents a single patient's case extracted from a source document. One source can produce multiple cases.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Case ID |
| `source_id` | `string` | The source this case was extracted from |
| `account_id` | `string` | Your account ID |
| `status` | `string` | Current processing state (this is NOT the http status code) |
| `created_timestamp` | `number` | When this Case was originally created (Unix nanoseconds)  |
| `updated_timestamp` | `number` | When this Case was last modified (Unix nanoseconds)  |
| `expiration_unix_time` | `number` | When this case and all its related data will be deleted (Unix seconds) |
| `medical_data` | `object` | Extracted medical documents — see [Medical Document](#medical-document-medical_data) |


### Patient Case status

| Value | Meaning |
|---|---|
| `created` | Waiting for system to begin processing |
| `processing` | The Case is in the middle of processing |
| `complete` | The case processing is done (Extracted JSON contents will be available) |
| `failed` | The case processing is done, but it failed. You will need to start over from the beginning (create a new source)  |

---


## Medical Document (medical_data)

HappyPathology intelligently scans your files to determine related pages of information. Then, it groups these pages into "Medical Documents" (For example, an Lab Order Form and a CBC Report would result in two Medical Documents). Lastly, it extracts data from the Medical Document's pages and stores the structured data.

The `medical_data` object is a map of all Medical Documents and their data.

Each Medical Document is keyed by a document ID (a ULID). A medical document's data is split into two categories: `patient_info` and `medical_tests`.

The Medical Document's structure looks like this:


| Field | Type | Description |
|---|---|---|
| `patient_info` | `object` | Patient demographic, billing, and clinical history extracted from this document |
| `medical_tests` | `Array<object>` | Distinct Medical orders/requisitions, and Medical Test Results |
| `tags` | `Array<string>` | Document tags used to identify special documents (e.g. `"precipio_requisition_form"`) |


Inside `patient_info` and `medical_tests`, each field the values can be in either of the following formats:

| Format | Description |
|---|---|
| `string` | Text value |
| `number` | int64 |
| `Array<string>` | Array of text values |
| `medical_test_format` | Object with value, unit, and reference range |


**Medical Test Format**

Medical Test Format is an object used to represent medical test results, such as CBC tests. The struct has the following fields:

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

### Example Medical Document

```json
{
    "patient_info": {
        "patient_address_1": "123 main rd",
        "patient_city": "fairfax",
        "patient_clinical_data": "chronic pancreatitis / leukopenia",
        "patient_dob": 953575425,
        "patient_first_name": "bob",
        "patient_last_name": "smith",
        "patient_phone_home": "4016134421",
        "patient_sex": "male",
        "patient_state": "va",
        "patient_zip": "22030"
    },
    "medical_tests": [
        {
            "specimen_collection_date": 1658760300,
            "specimen_ordering_facility": "good care llc",
            "specimen_ordering_physician": "dr. mary zhao",
            "specimen_performing_lab": "labcorp virginia",
            "specimen_received_date": 1658793600,
            "specimen_type": "peripheral blood"
        }
    ],
}
```

## All Patient Info Fields
This is a comprehensive list of fields that are extracted and placed into the `patient_info` object.


### Patient Information

| Field | Type | Description |
|---|---|---|
| `patient_first_name` | `string` | |
| `patient_last_name` | `string` | |
| `patient_middle_name` | `string` | |
| `patient_suffix` | `string` | |
| `patient_mrn` | `string` | Medical record number |
| `patient_id` | `string` | This is not the MRN. Labs often have their own unique ID for the patient |
| `patient_dob` | `number` | Unix Seconds timestamp |
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
| `patient_clinical_data` | `string` | A summary of the patient's signs, symptoms, clinical impressions, and prior diagnosis mentioned in the document |
| `patient_icd10_codes` | `Array<string>` | Patient's listed ICD10 codes in the document (Does not generate/infer ICD10 Codes) |


### Miscellaneous
| Field | Type | Description |
| - |- |-|
| `document_printed_date` | `number` | When the document was printed or downloaded (Unix seconds) |


### Precipio Patient and Physician Information

| Field | Type | Description |
| - |- |-|
| `precipio_patient_next_appointment_datetime` | `number` | Unix seconds |
| `precipio_patient_clinical_status` | `string` | |
| `precipio_patient_clinical_indications` | `Array<string>` | |
| `precipio_copy_physician_name` | `string` | |


## All Medical Tests Fields
This is a comprehensive list of fields that are extracted and placed into the `medical_tests` objects.


### Specimen Information

| Field | Type | Description |
| - |- |-|
| `specimen_type` | `string` | What type of sample is the specimen (Blood, Bone Marrow, Etc) |
| `specimen_ordering_facility` | `string` | |
| `specimen_ordering_physician` | `string` | |
| `specimen_performing_lab` | `string` | |
| `specimen_collection_date` | `number` | The date the specimen was extracted from the Patient (Unix seconds) |
| `specimen_received_date` | `number` | The date the specimen was received by the lab (Unix seconds) |
| `specimen_reported_date` | `number` | The date the test was performed on the specimen (Unix seconds) |


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


### Precipio Orders

| Field | Type | Description |
| - |- |-|
| `precipio_tests_requested` | `Array<string>` | |
| `precipio_test_ids` | `Array<string>` | |



