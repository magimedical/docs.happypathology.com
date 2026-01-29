---
title: Sample Code
description: Example code for integrating with the API.
---

The following code sample demonstrates a complete example of interaction with the api.
This code references two additional files.

1.  Private key file
2.  Dataset file

## Dataset File

A json file that lists samples with or without malaria, you can instead call the `process` function on any picture, providing it's path and the estimated RBC diameter in pixels. If you prefere to use the json dataset the format is as follows:

```json
{
  "id": "zuhzzymvay",
  "has_malaria": [
    {
      "path": "000000_tile2_1_has.jpg",
      "rbc_diameter": 85,
    },
    {
    "path": "000000_tile1_1_has.jpg",
    "rbc_diameter": 85,
    }
  ],
  "no_malaria": [
    {
      "path": "1 7.jpg",
      "rbc_diameter": 35,
    },
     {
      "path": "10.jpg",
      "rbc_diameter": 87,
     }
  ]
}
```

## Private Key File

A private key. Please follow the instructions from the "auth" section above and contact us at support@happypathology.com to enable your key. and provide you with your key ID.

## Sample Code

This code can be used as a starting point to build integration with HappyPathology's diagnostic API.

```go
package main

import (
    "bytes"
    "crypto/x509"
    "encoding/json"
    "encoding/pem"
    "fmt"
    "io"
    "log"
    "net/http"
    "net/url"
    "os"
    "path"
    "time"

    "github.com/lestrrat-go/jwx/jwa"
    "github.com/lestrrat-go/jwx/jwk"
    "github.com/lestrrat-go/jwx/jwt"
)

var pathToTheDatasetDefinitionJSON = "./dataset_definition.json"
var datasetRootPath = "../../../BloodSamples/MalariaDataset"
var serviceRootPath = "https://in.api.happypathology.com"

var authAudience = "dev.api.happypathology.com"
var authIssuer = "Miriam_Technologies_org_id"
var keyID = "vkzzmyxhli"
var privateKeyFilePath = "miriam_private.key"

type postStudyApiResponse struct {
    Status  int `json:"status,omitempty"`
    Results struct {
        PBSStudyID string `json:"pbs_study_id,omitempty"`
    } `json:"results,omitempty"`
}

type FindingStat struct {
    ConceptID string            `json:"idea_id"`
    Count     int               `json:"count"`
    items     []interface{}     `json:"-"` //
    units     interface{}       `json:"-"` //
    Meta      map[string]string `json:"meta"`
}

type Finding struct {
    ID      string      `json:"id"`
    Finding interface{} `json:"finding"`
}

type FindingsSummaryReport struct {
    PBSStudyID string `json:"pbs_study_id,omitempty"`
    FileID     string `json:"file_id,omitempty"`
    // a maps of idea.ID to FindingStats
    FindingStats map[string]FindingStat `json:"finding_stats,omitempty"`
    Findings     []Finding              `json:"findings,omitempty"`
}

type SummaryReports struct {
    FieldsOfViewProcessed int                    `json:"fields_of_view_processed,omitempty"`
    ModelFindings         []map[string][]float64 `json:"model_findings,omitempty"`
}

type postFileAPIResponse struct {
    Status int `json:"status,omitempty"`
}

type getReportResponse struct {
    Status  int `json:"status,omitempty"`
    Results struct {
        PBSStudyID string `json:"pbs_study_id,omitempty"`
        Report     map[string]struct {
            RawReports     map[string]FindingsSummaryReport `json:"raw_reports,omitempty"`
            Conclusion     string                           `json:"conclusion,omitempty"`
            SummaryReports SummaryReports                   `json:"summary_reports,omitempty"`
        } `json:"report"`
    } `json:"results,omitempty"`
}

type Result struct {
    Timestamp int64                  `json:"timestamp,omitempty"`
    Summary   []map[string][]float64 `json:"summary,omitempty"`
}

type TaskRequestBody struct {
    DiagnosticTasks []string `json:"diagnostic_tasks,omitempty"`
}

type Picture struct {
    Path        string  `json:"path,omitempty"`
    RBCDiameter float64 `json:"rbc_diameter,omitempty"`
    Results     Result  `json:"results,omitempty"`
}

type DatasetDefinition struct {
    ID         string    `json:"id,omitempty"`
    HasMalaria []Picture `json:"has_malaria,omitempty"`
    NoMalaria  []Picture `json:"no_malaria,omitempty"`
}

func main() {
    fmt.Println("let the fun begin!")

    datasetDefinitionJSON, err := os.ReadFile(pathToTheDatasetDefinitionJSON)
    if err != nil {
        log.Fatalf("error reading the dataset definition json file. Err: %v", err)
    }

    var dataset DatasetDefinition
    err = json.Unmarshal(datasetDefinitionJSON, &dataset)
    if err != nil {
        log.Fatalf("error parsing the dataset definition json file. Err: %v", err)
    }

    fmt.Printf("working on dataset %s\n", dataset.ID)

    defer func() {
        if r := recover(); r != nil {
            fmt.Println("😱 Recovered from Panic to save the data", r)
            os.Exit(2)
        }
    }()

    defer func() {
        // save the results
        datasetDefinitionJSON, err := json.Marshal(dataset)
        if err != nil {
            log.Fatalf("error marshaling the dataset %v", err)
        }
        err = os.WriteFile(fmt.Sprintf("./%d-dataset_definition.json", time.Now().UnixNano()), datasetDefinitionJSON, os.ModePerm)
        if err != nil {
            log.Fatalf("error saving the results the dataset %v", err)
        }
    }()

    counter := 0
    for idx, p := range dataset.HasMalaria {
        pictureFullPath := fmt.Sprintf("%s/%s/%s", datasetRootPath, "HasMalaria", p.Path)
        if p.RBCDiameter == 0 {
            fmt.Printf("NEEDS RBC SIZE %s\n", pictureFullPath)
            continue
        }
        // if p.RBCDiameter < 20 || hasModelOpinion(p.Results, malariaDetectionModelID) || counter > 3 {
        //  continue
        // }
        counter++
        res, err := process(pictureFullPath, p.RBCDiameter)
        if err != nil {
            log.Printf("error processing picture %s %v", pictureFullPath, err)
        }
        dataset.HasMalaria[idx].Results = res
    }
    counter = 0
    for idx, p := range dataset.NoMalaria {
        pictureFullPath := fmt.Sprintf("%s/%s/%s", datasetRootPath, "NoMalaria", p.Path)
        if p.RBCDiameter == 0 {
            fmt.Printf("NEEDS RBC SIZE %s\n", pictureFullPath)
            continue
        }
        // if p.RBCDiameter < 20 || hasModelOpinion(p.Results, malariaDetectionModelID) || counter > 3 {
        //  continue
        // }
        counter++
        res, err := process(pictureFullPath, p.RBCDiameter)
        if err != nil {
            log.Printf("error processing picture %s %v", pictureFullPath, err)
        }
        dataset.NoMalaria[idx].Results = res
    }
}

func process(pictureFullPath string, rbcDiameter float64) (Result, error) {
    authToken := generateAuthToken(authAudience, authIssuer, keyID, privateKeyFilePath)
    var results = Result{}
    fileName := path.Base(pictureFullPath)

    // create a new study === === === === === === === === === === === === === === === === === === === === === === === ===
    payload := map[string]string{
        "purpose":         "malaria_benchmark",
        "batch_id":        "1726761285225121000",
        "local_file_name": fileName,
    }
    payloadBytes, err := json.Marshal(payload)
    if err != nil {
        return results, fmt.Errorf("error marshaling tags to json %v", err)
    }
    q, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/pbs", serviceRootPath), bytes.NewBuffer(payloadBytes))
    if err != nil {
        return results, fmt.Errorf("error creating request %v", err)
    }
    q.Header.Add("Authorization", fmt.Sprintf("Bearer %s", authToken))
    c := http.DefaultClient
    resp, err := c.Do(q)
    if err != nil {
        return results, fmt.Errorf("error talking to the service %v", err)
    }
    if resp.StatusCode != http.StatusCreated {
        return results, fmt.Errorf("got unexpected status code when calling to create a new study %d", resp.StatusCode)
    }

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return results, fmt.Errorf("error reading response body %v", err)
    }
    var studyPostResults postStudyApiResponse
    err = json.Unmarshal(body, &studyPostResults)
    if err != nil {
        return results, fmt.Errorf("error parsing the response body %v", err)
    }

    PBSStudyID := studyPostResults.Results.PBSStudyID

    fmt.Printf("StudyID %s\n", PBSStudyID)

    // upload the file === === === === === === === === === === === === === === === === === === === === === === === ===

    fileReader, err := os.Open(pictureFullPath)
    if err != nil {
        return results, fmt.Errorf("cannot open the file %s for reading %v", pictureFullPath, err)
    }
    defer fileReader.Close()
    q, err = http.NewRequest(http.MethodPost, fmt.Sprintf("%s/pbs/%s/files", serviceRootPath, PBSStudyID), fileReader)
    if err != nil {
        return results, fmt.Errorf("error creating the request to submit the file %v", err)
    }
    q.Header.Add("Authorization", fmt.Sprintf("Bearer %s", authToken))
    qParams := url.Values{}
    qParams.Add("file_name", fileName)
    qParams.Add("rbc_diameter", fmt.Sprintf("%0.2f", rbcDiameter))
    q.URL.RawQuery = qParams.Encode()

    c = http.DefaultClient
    resp, err = c.Do(q)
    if err != nil {
        return results, fmt.Errorf("error submiting the picture to the fiels api %v", err)
    }
    if resp.StatusCode != http.StatusAccepted {
        return results, fmt.Errorf("got unexpected status code uploading the file %d", resp.StatusCode)
    }
    body, err = io.ReadAll(resp.Body)
    if err != nil {
        return results, fmt.Errorf("error reading response to file upload %v", err)
    }
    var postFileResults postFileAPIResponse
    err = json.Unmarshal(body, &postFileResults)
    if err != nil {
        return results, fmt.Errorf("error parsing response to file upload %v", err)
    }
    if postFileResults.Status > 300 {
        return results, fmt.Errorf("unexpected response to file upload %v", postFileResults)
    }

    // submit task === === === === === === === === === === === === === === === === === === === === === === === ===
    reqBody := TaskRequestBody{
        []string{"MALARIA_ANY_ANY"},
    }
    bodyBytes, err := json.Marshal(reqBody)
    if err != nil {
        return results, fmt.Errorf("error marshaling tasks request body %v", err)
    }
    q, err = http.NewRequest(http.MethodPost, fmt.Sprintf("%s/pbs/%s/tasks", serviceRootPath, PBSStudyID), bytes.NewReader(bodyBytes))
    if err != nil {
        return results, fmt.Errorf("error creating request to submit a task %v", err)
    }
    q.Header.Add("Authorization", fmt.Sprintf("Bearer %s", authToken))

    c = http.DefaultClient
    resp, err = c.Do(q)
    if err != nil {
        return results, fmt.Errorf("error calling api to submit a task %s err: %v", PBSStudyID, err)
    }
    if resp.StatusCode != http.StatusAccepted {
        return results, fmt.Errorf("error calling api to submit a task %s err: %v", PBSStudyID, err)
    }

    // wait until response is ready === === === === === === === === === === === === === === === === === === === === === === === ===

    time.Sleep(time.Minute * 2)

    // check the results === === === === === === === === === === === === === === === === === === === === === === === ===
    q, err = http.NewRequest(http.MethodGet, fmt.Sprintf("%s/pbs/%s/reports/MALARIA_ANY_ANY", serviceRootPath, PBSStudyID), nil)
    if err != nil {
        return results, fmt.Errorf("error creating request to get the report %v", err)
    }
    q.Header.Add("Authorization", fmt.Sprintf("Bearer %s", authToken))

    c = http.DefaultClient
    resp, err = c.Do(q)
    if err != nil {
        return results, fmt.Errorf("error calling api to get report for study %s err: %v", PBSStudyID, err)
    }
    body, err = io.ReadAll(resp.Body)
    if err != nil {
        return results, fmt.Errorf("error reading response body when getting report for study %s err %v", PBSStudyID, err)
    }
    var reportResults getReportResponse
    err = json.Unmarshal(body, &reportResults)
    if err != nil {
        return results, fmt.Errorf("error parsing response to report request %v", err)
    }
    if len(reportResults.Results.Report) > 0 {
        results.Timestamp = time.Now().UnixNano()
        results.Summary = reportResults.Results.Report["MALARIA_ANY_ANY"].SummaryReports.ModelFindings
    } else {
        fmt.Println(string(body))
        fmt.Println(pictureFullPath)
    }

    return results, nil
}

// if we feed data that is not of size 3 this can crash or return false results
func evidenceOfMalaria(data []float64) bool {
    return data[0] > 0.9
    // return data[0] > data[1] && data[0] > data[2]
}

func hasModelOpinion(results Result, modelID string) bool {
    for _, v := range results.Summary {
        for k := range v {
            if k == modelID {
                return true
            }
        }
    }

    return false
}

func generateAuthToken(authAudience string, authIssuer string, keyID string, privateKeyFilePath string) string {

    _PRIVATE_KEY_, err := os.ReadFile(privateKeyFilePath)
    if err != nil {
        log.Fatal(err)
    }

    // create a new jwt
    issued := time.Now()
    exp := time.Now().Add(time.Hour)
    j := jwt.NewBuilder()
    j.Audience([]string{authAudience})
    j.Expiration(exp)
    j.IssuedAt(issued)
    j.Issuer(authIssuer)
    j.JwtID(fmt.Sprintf("%d", time.Now().UnixNano()))
    j.Subject("test_subject")
    j.Claim("kid", keyID)

    token, err := j.Build()
    if err != nil {
        log.Fatal(err)
    }
    block, _ := pem.Decode(_PRIVATE_KEY_)
    key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
    if err != nil {
        log.Fatalf("%v", err)
    }

    kk, err := jwk.New(key)
    if err != nil {
        log.Fatal(err)
    }
    signedT, err := jwt.Sign(token, jwa.RS256, kk)
    if err != nil {
        log.Fatal(err)
    }
    return string(signedT)
}
```
