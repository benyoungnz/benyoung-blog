---
title: "Tech Preview of Public Reporting API - Veeam Data Cloud "
description: 'A brand-new Veeam Data Cloud (VDC) Public API is now available in technical preview for our Microsoft 365 Backup service. Streamline your operations, check out today.'
heroImage: '/content/images/2024/vdc-public-api-hero.jpg'
slug: 'veeam-data-cloud-public-reporting-api-preview'
pubDate: "2024-10-08T21:42:37.126Z"
tags: ["veeam", "api", "veeamdatacloud"]
categories: ["VeeamDataCloud"]
author: ["ben"]
---

A brand-new Veeam Data Cloud (VDC) Public API is now available in technical preview for our Microsoft 365 Backup service! If you are using VDC today and you're into streamlining your operations, this is something you'll want to check out.

In this first release, the API focuses on backup session observability for your Microsoft 365 backup jobs by easily providing you information about what jobs you have and their settings, as well as an audit log of when the backup jobs ran and their status. But it doesn't stop there—you can also pull detailed logs for each session (and even request a download), making compliance, troubleshooting and monitoring simple.

The VDC team won't be stopping here, expect more endpoints to be rolled into the Public API enabling you to automate more tasks across the range of services that we deliver.

Before we take a look at what this first release contains, authentication is API key-based, making machine-to-machine communication and scripting. You need to head into settings, then system followed by the VDC Public API tab.

> During preview we are enabling this on a case by case basis, simply log a support ticket to have this enabled on your tenancy.

![Setting up your API Key in VDC](/content/images/2024/VDC-public-API-enable.png)

## Reporting Endpoints

> Below your API key generation you will see the base URL for the API depending on you region. I will use relative paths below.

### Backup Jobs
This gets a list of all backup jobs configured, including various status / statistics metadata. Useful for tracking your jobs at a high level. 

The id is important for additional, more granular calls to job sessions and job session log endpoints.

**GET to /v1/reports/backup-jobs**

```json
[
    {
        "id": "fb72761a-522f-4195-a524-c2df486ab592",
        "name": "All Exchange objects",
        "backupType": "SelectedItems",
        "jobType": "Backup",
        "isEnabled": true,
        "lastRun": "2024-10-06T02:50:38.031266Z",
        "lastStatus": "Success",
        "nextRun": "2024-10-07T02:49:03Z",
        "avgJobProcessTimeInSeconds": 103,
        "organizationVboInstanceId": 1
    },
    {
        "id": "e65605a9-f414-4a35-8dab-d478863e401a",
        "name": "All other objects",
        "backupType": "SelectedItems",
        "jobType": "Backup",
        "isEnabled": true,
        "lastRun": "2024-10-06T01:36:57.3877291Z",
        "lastStatus": "Warning",
        "nextRun": "2024-10-07T01:30:00Z",
        "avgJobProcessTimeInSeconds": 1181,
        "organizationVboInstanceId": 1
    }
]
```

### Backup Job Sessions
This gets a list of all backup sessions for a job. The backup job id is required as part of the URL. You will see a list ordered by latest to oldest. Includes metadata such as the created (start) and end time of the job and what the status was - perfect for reporting RPO compliance. 

The id below (which is jobsessionid) is important and will be needed for the session log calls.

**GET to /v1/Reports/backup-jobs/{id}/job-sessions**

```json
[
    {
        "id": "130349ce-3d5a-4abe-b6b0-4136897b311c",
        "creationTime": "2024-10-06T02:49:03.0340898Z",
        "endTime": "2024-10-06T02:50:38.031266Z",
        "progress": 66,
        "status": "Success",
        "processedObjects": 2,
        "jobId": null,
        "copyJobId": null,
        "jobType": "Backup"
    },
    {
        "id": "c3af5315-650b-475f-bedf-dd79906a9a33",
        "creationTime": "2024-10-05T02:49:03.0349864Z",
        "endTime": "2024-10-05T02:50:37.6071126Z",
        "progress": 66,
        "status": "Success",
        "processedObjects": 1,
        "jobId": null,
        "copyJobId": null,
        "jobType": "Backup"
    }
]
```

### Backup Job Session Log
A full stream of the logs from the backup service itself. Listing such items as mailbox & site names, with their appropriate status. If there are warnings, such as users that are not licensed for Microsoft 365 you will see these here. Other system level logs such as job starting/stopping and total data transferred is also reported here.

**GET to /v1/Reports/backup-jobs/{id}/job-sessions{jobsessionid}/logs**

```json
[
    {
        "id": "0578f958-804e-4f5c-bb67-cfd80e26a278",
        "title": "[Success] Job started at 9/23/2024 2:49:03 AM",
        "creationTime": "2024-09-23T02:49:04.0144832Z",
        "endTime": "2024-09-23T02:49:04.0144832Z"
    },
    {
        "id": "21242ae2-e0bc-489f-8cf5-80d3b74f3bbb",
        "title": "[Success] Connected to organization",
        "creationTime": "2024-09-23T02:49:04.0494764Z",
        "endTime": "2024-09-23T02:49:08.2920455Z"
    },
    {
        "id": "7cd8c0c8-53dc-412b-bc7a-202fe669ddea",
        "title": "[Success] Found 1 excluded objects. All personal sites are excluded",
        "creationTime": "2024-09-23T02:49:09.370648Z",
        "endTime": "2024-09-23T02:49:09.3806082Z"
    },
    {
        "id": "bd135d2c-07b7-4047-a09e-1b09a792e84c",
        "title": "[Success] Found 66 objects",
        "creationTime": "2024-09-23T02:49:09.3856497Z",
        "endTime": "2024-09-23T02:50:27.2718751Z"
    },
    {
        "id": "a54fdc42-0789-46e3-82c7-b95a6e6a920d",
        "title": "[Success] Processing mailbox: Adams@M365x33945498.OnMicrosoft.com",
        "creationTime": "2024-09-23T02:49:22.1096408Z",
        "endTime": "2024-09-23T02:49:36.7408519Z"
    },
    {
        "id": "924fd75c-6c11-4a3d-83d0-8cd3c361fe15",
        "title": "[Success] Processing mailbox: AdeleV@M365x33945498.OnMicrosoft.com",
        "creationTime": "2024-09-23T02:49:23.3067491Z",
        "endTime": "2024-09-23T02:49:39.9558776Z"
    },
    {
        "id": "acf00b5b-0481-4b7b-8178-dacae4ddfe57",
        "title": "[Success] Transferred: 168.8 MB (2472 items) at 1.8 MB/s (26 items/s)",
        "creationTime": "2024-09-23T02:50:36.3480018Z",
        "endTime": "2024-09-23T02:50:36.3480018Z"
    },
    {
        "id": "f5dd21ea-0ef4-4108-bb5d-82d91303f54f",
        "title": "[Success] Job finished at 9/23/2024 2:50:36 AM",
        "creationTime": "2024-09-23T02:50:36.4287368Z",
        "endTime": "2024-09-23T02:50:36.4287368Z"
    }
]
```

> You can also receive a download stream if you prefer to download and store and/or parse this way instead of a JSON representation, simply add /download at the end of the URL. i.e /v1/Reports/backup-jobs/{id}/job-sessions{jobsessionid}/logs**/download**