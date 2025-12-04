---
title: Complete Blood Count (CBC) Processing Workflow
description: Guide for submitting CBC images for processing.
---

This guide outlines the process of submitting pictures or pdf files of CBC results or CBC machine printouts for processing.

## Overview

The workflow consists of the following steps:

1.  Create a new "Source"
2.  Wait for processing
3.  Check for reports

## Detailed Workflow

### 1. Create a New Source

Create a new source to obtain a Source ID (CBC-ID) for subsequent operations.

#### HTTP Request

`POST /v1/sources`

```shell
# STEP 1: Create A New study
echo '{"patient_proxy_id":"PPID12345","sample_id":"XYZ12345678","device_id":"SABCD"}' | \
http -f POST https://in.api.happypathology.com/sources \
'Authorization:HAPPYPATHOLOGY_AUTH_TOKEN'
```

#### Response

```json
{
  "status": 201,
  "results": {
    "cbc_study_id": "c7d453a9-676d-4b9f-a505-8a9021b76dfd",
    "tags": {
      "patient_proxy_id": "PPID12345",
      "sample_id":"XYZ12345678",
      "device_id":"SABCD"
    }
  }
}
```

> **Warning**: Do not include Personally Identifiable Information (PII) or Personal Health Information (PHI) in tags.

### 2. Upload Image Files

Upload images associated with the CBC study.
For each image, you are required to provide `rbc_diameter` parameter as a URL query param.
`rbc_diameter` is the number of pixels in the diameter of a normal human Red Blood Cell in the image. This is a measure of magnification that includes digital and optical and sensor size related magnifications.
You do NOT need to measure this for every image. You can do the measurements once and use the same number for all image prepared with the same device settings.
Alternatively you can share samples with HappyPathology and HappyPathology will provide the numbers for your use.

#### HTTP Request

`POST /pbs/{PBS_ID}/files?file_name={filename}&rbc_diameter={size}`

```shell
# STEP 2. Upload Image Files
http -f POST \
https://in.api.happypathology.com/pbs/YOUR_NEW_PBS_ID/files?file_name=MS12_12.jpg&rbc_diameter=85 \
'Authorization:HAPPYPATHOLOGY_AUTH_TOKEN' < /path/to/MS12_12.jpg
```

#### Response

```json
{
  "status": 201,
  "results": {
    "pbs_study_id": "c7d453a9-676d-4b9f-a505-8a9021b76dfd",
    "file_id": "sha224-i-4d58b0cee1e38f75f93e2e605d1e6ad44c24a975d0c3b53367de7c86"
  }
}
```

> **Note**: This is not a multipart upload. The entire request body should contain the image data.

### 3. Request a Detection Task

After uploading all files, request a detection task to be performed on the PBS.

#### Available Detection Tasks

| Task | Type | Identifier | Description |
| :--- | :--- | :--- | :--- |
| Detect Any Signs of Malaria | Detection | `MALARIA_ANY_ANY` | Reports any sign of malaria parasites, including all species, active infections, and infections under treatment |

#### HTTP Request

`POST /pbs/{PBS_ID}/tasks`

```shell
# STEP 3. Request a Detection Task
echo '{"diagnostic_tasks":["MALARIA_ANY_ANY"]}' | \
http -f POST https://in.api.happypathology.com/pbs/YOUR_NEW_PBS_ID/tasks \
'Authorization:HAPPYPATHOLOGY_AUTH_TOKEN'
```

#### Response

```json
{
  "results": {
    "pbs_study_id": "48ae6352-d15d-440a-83f3-05a1f68aa11b",
    "tasks": [
      "TASK_1_IDENTIFIER"
    ]
  }
}
```

### 4. Wait for Processing

Processing time varies based on number of files and their size, number of tasks, and system workload and available resources. You can either:

-   Optionally wait for a callback if you provided the `callback_url` to be called
-   Check the status manually

#### Check Status

`GET /pbs/{PBS_ID}/status/MALARIA_ANY_ANY`

```shell
# STEP 4. Wait for Processing
http https://in.api.happypathology.com/pbs/YOUR_NEW_PBS_ID/status/MALARIA_ANY_ANY \
'Authorization:HAPPYPATHOLOGY_AUTH_TOKEN'
```

#### Response

```json
{
  "status": 200,
  "results": {
    "pbs_study_id": "62dd0300-880e-4069-bea8-66c9ca73c207",
    "report_status": "ready",
    "progress": 1.0,
    "progress_message": "Reports are ready"
  }
}
```

### 5. Retrieve the Detection Report

Once processing is complete, retrieve the report for the requested detection task.

#### HTTP Request

`GET /pbs/{PBS_ID}/reports/{TASK_IDENTIFIER}`

```shell
# STEP 5. Retrieve the Detection Report
http https://in.api.happypathology.com/pbs/YOUR_NEW_PBS_ID/reports/MALARIA_ANY_ANY \
'Authorization:HAPPYPATHOLOGY_AUTH_TOKEN'
```

#### Response

```json
{
  "status": 200,
  "results": {
    "pbs_study_id": "4bb7fe9e-b608-4d68-adbe-8655c991f494",
    "conclusion": "present",
    "tile_data": [
      {
        "image_id": "sha224-s01-e4fca243d465749062f8bf4fa6d416d6b944f6a2af55573c5e13c732",
        "tile_location": {
          "x": 512,
          "y": 512
        },
        "likelihood": 0.4491
      }
    ]
  },
  "debug_info": {
    "delta": "846.611195ms",
    "version": "bb_api.591.develop.1c2aa2d"
  }
}
```

## Best Practices

1.  Store and track the PBS-ID (Study ID) throughout the process.
2.  Ensure accurate "rbc diameter" when uploading images.
3.  Use HTTPS for the optional callback URLs and consider including a cryptographic signature for security.
4.  Do not include PII or PHI in tags or the optional callback URLs.

For any issues or questions, please contact support@happypathology.com
