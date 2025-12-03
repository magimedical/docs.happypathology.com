---
title: Endpoints
description: Overview of HappyPathology API endpoints.
---

HappyPathology API provides access through region-specific endpoints to ensure compliance with local regulations. All data submitted to a regional endpoint are processed on infrastructure dedicated to that geographical or regulatory region.

## Security

All HappyPathology API endpoints are accessible exclusively through encrypted (TLS) connections, ensuring the highest level of data protection during transmission.

## Special Purpose Endpoints

In addition to regional production endpoints, HappyPathology offers special-purpose endpoints for specific use cases:

### Development Endpoint (DEV)

-   **URL**: `https://dev.api.happypathology.com`
-   **Purpose**: Internal development and testing
-   **Access**: Requires developer credentials
-   **Important Notes**:
    -   Not HIPAA compliant
    -   Not suitable for production use
    -   Submitted information may be inspected by HappyPathology staff
    -   No privacy law protections apply

### Quality Assurance Endpoint (QA)

-   **URL**: `https://qa.api.happypathology.com`
-   **Purpose**: External quality assurance and automated testing
-   **Access**: Requires QA credentials
-   **Use Case**: Run automated benchmarks before significant hardware or software changes that may affect output quality or clinical validity
-   **Important Notes**:
    -   Not HIPAA compliant
    -   Not suitable for production use
    -   Submitted information may be inspected by HappyPathology staff
    -   No privacy law protections apply

## Regional Endpoints

Choose the appropriate regional endpoint based on your location and regulatory requirements:

| Region | Endpoint | Users |
| :--- | :--- | :--- |
| USA | `https://us.api.happypathology.com` | Production use for customers in the United States |
| Canada | `https://ca.api.happypathology.com` | Production use for customers in Canada |
| EU | `https://eu.api.happypathology.com` | Production use for customers in the European Union |
| India | `https://in.api.happypathology.com` | DEMO MODE |

Please ensure you select the correct endpoint for your region to maintain compliance with local regulations and data protection laws.
