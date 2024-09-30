---
title: 'Trying the new JSON payload super powers in Veeam Update 4' 
description: 'We now know with Veeam U4 you can specify an application/json accept header
[https://benyoung.blog/veeam-api-json-support-sort-of/]  and have your req'
heroImage: '/content/images/2019/01/Screen-Shot-2019-01-22-at-12.02.03-PM.png'
slug: 'trying-the-new-json-payload-super-powers-in-veeam-update-4'
pubDate: '2019-01-21T22:57:39.000Z'
tags: ["veeam", "api", "u4", "update4", "json", "cloudtenant"] 
categories: ['veeam']
author: ["ben"]
---

We now know with [Veeam U4 you can specify an application/json accept header](https://benyoung.blog/veeam-api-json-support-sort-of/) and have your requests returned as a nice JSON payload which is neat.

In a super basic example here is how to edit a CloudTenant using JSON instead of a XML payload, it also includes the [new TenantType node which is required](https://benyoung.blog/edit-cloudtenant-via-rest-new-tenanttype-node/) as of v1_4 of the API.

## Request

Remember to set Accept: application/json in your headers

PUT http://:9399/api/cloud/tenants/{ID}

```
{
    "Description": "We are going to update via a JSON payload",
    "Enabled": true,
    "MaxConcurrentTasks": 1,
    "TenantType": {
        "StandaloneTenant": {
            "TenantCredentials": {
                "Username": "AudiEnterprises-FFFTIBI541"
            }
        }
    }
}

```

## Response

You will receive the task reference back, also as JSON

```
{
    "TaskId": "task-9",
    "State": "Running",
    "Operation": "EditCloudTenant",
    "Links": [
        {
            "Rel": "Delete",
            "Href": "http://cloudconnect1.testcloudspace.co.nz:9399/api/tasks/task-9"
        }
    ],
    "Href": "http://cloudconnect1.testcloudspace.co.nz:9399/api/tasks/task-9",
    "Type": "Task"
}

```

## Result

If you re-fetch the CloudTenant you will see that the description has been updated with the new description, json end-to-end. nice!

```
{
  "Password": "",
  "Description": "We are going to update via a JSON payload",
  "Enabled": true,
  "LeaseOptions": {
    "Enabled": false
  },
  "Resources": {
    "CloudTenantResources": []
  },
  "LastResult": "Success",
  "LastActive": "1753-01-01T00:00:00Z",
  "ComputeResources": {
    "CloudTenantComputeResources": []
  },
  "ThrottlingEnabled": false,
  "ThrottlingSpeedLimit": 1,
  "ThrottlingSpeedUnit": "Mbps",
  "PublicIpCount": 0,
  "BackupCount": 0,
  "ReplicaCount": 0,
  "MaxConcurrentTasks": 1,
  "WorkStationBackupCount": 0,
  "ServerBackupCount": 0,
  "BackupProtectionEnabled": false,
  "BackupProtectionPeriod": 1,
  "TenantType": {
    "StandaloneTenant": {
      "TenantCredentials": {
        "Username": "AudiEnterprises-FFFTIBI541"
      }
    }
  },
  "Name": "AudiEnterprises-FFFTIBI541",
  "UID": "urn:veeam:CloudTenant:95c26e34-1b8e-456e-aa21-c527bda7e311",
  "Links": [
    ...removed
  ],
  "Href": "http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants/95c26e34-1b8e-456e-aa21-c527bda7e311?format=Entity",
  "Type": "CloudTenant"
}

```

