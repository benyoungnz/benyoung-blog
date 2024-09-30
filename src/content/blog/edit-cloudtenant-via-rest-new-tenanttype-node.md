---
title: 'New TenantType node in CloudTenant Schema with Veeam Update 4'
description: 'Starting with Veeam U4 and assuming you are logging in with either v=latest or v=v1_4 there are some modifications you will need to make for editing cloud tenants.'
heroImage: '/content/images/2019/01/Screen-Shot-2019-01-22-at-11.42.50-AM.png'
slug: 'edit-cloudtenant-via-rest-new-tenanttype-node'
pubDate: '2019-01-21T22:42:10.000Z'
tags: ["veeam", "api", "cloudtenant", "tenanttype", "update4", "u4"] 
categories: ['veeam']
author: ["ben"]
---

Starting with Veeam U4 and assuming you are logging in with either v=latest or v=v1_4 there are some modifications you will need to make for editing cloud tenants.

## What happens if you don't add this new node?

Expect a lovely http 500 / object reference error...

```
<?xml version="1.0" encoding="utf-8"?>
<Error Message="Object reference not set to an instance of an object." StatusCode="500" xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <FirstChanceExceptionMessage>Object reference not set to an instance of an object.</FirstChanceExceptionMessage>
</Error>

```

## Example

PUT http://:9399/api/cloud/tenants/{ID}

### New Node

```
<TenantType>
<StandaloneTenant>
    <TenantCredentials>
        <Username>USERNAME-HERE</Username>
    </TenantCredentials>
</StandaloneTenant>
</TenantType>

```

I am still awaiting the release documentation but if you change the value of the username nothing is updated so potentially only ready only?

### Edit Payload Sample

Simple update example to change the description of the tenant but add/remove the other nodes as required with your edits.

```
<CloudTenant Type="CloudTenant" xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<Description>We are going to update the description...</Description>
<MaxConcurrentTasks>1</MaxConcurrentTasks>
<TenantType>
    <StandaloneTenant>
        <TenantCredentials>
            <Username>AudiEnterprises-FFFTIBI541</Username>
        </TenantCredentials>
    </StandaloneTenant>
</TenantType>
</CloudTenant>

```

### Result

As usual you will receive an HTTP 202 Accepted, with a task reference

```
<?xml version="1.0" encoding="UTF-8"?>
<Task xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/tasks/task-7" Type="Task">
   <Links>
      <Link Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/tasks/task-7" Rel="Delete" />
   </Links>
   <TaskId>task-7</TaskId>
   <State>Running</State>
   <Operation>EditCloudTenant</Operation>
</Task>

```

And then if you get the task reference you get the operation success / failure

```
    <?xml version="1.0" encoding="utf-8"?>
<Task Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/tasks/task-7" Type="Task" xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Links>
        <Link Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/tasks/task-7" Rel="Delete"/>
        <Link Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants/95c26e34-1b8e-456e-aa21-c527bda7e311?format=Entity" Name="AudiEnterprises-FFFTIBI541" Type="CloudTenant" Rel="Related"/>
    </Links>
    <TaskId>task-7</TaskId>
    <State>Finished</State>
    <Operation>EditCloudTenant</Operation>
    <Result Success="true">
        <Message>Ok</Message>
    </Result>
</Task>

```

Following the reference link/refetching your cloud tentant using the following endpoint will show you your updates. In our case just the description.

GET http://:9399/api/cloud/tenants/{ID}?format=Entity

```
<?xml version="1.0" encoding="utf-8"?>
<CloudTenant Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants/95c26e34-1b8e-456e-aa21-c527bda7e311?format=Entity" Type="CloudTenant" Name="AudiEnterprises-FFFTIBI541" UID="urn:veeam:CloudTenant:95c26e34-1b8e-456e-aa21-c527bda7e311" xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Links>
        ...removed
    </Links>
    <Password/>
    <Description>We are going to update the description...</Description>
    <Enabled>true</Enabled>
    <LeaseOptions Enabled="false"/>
    <Resources/>
    <LastResult>Success</LastResult>
    <LastActive>1753-01-01T00:00:00Z</LastActive>
    <ComputeResources/>
    <ThrottlingEnabled>false</ThrottlingEnabled>
    <ThrottlingSpeedLimit>1</ThrottlingSpeedLimit>
    <ThrottlingSpeedUnit>Mbps</ThrottlingSpeedUnit>
    <PublicIpCount>0</PublicIpCount>
    <BackupCount>0</BackupCount>
    <ReplicaCount>0</ReplicaCount>
    <MaxConcurrentTasks>1</MaxConcurrentTasks>
    <WorkStationBackupCount>0</WorkStationBackupCount>
    <ServerBackupCount>0</ServerBackupCount>
    <BackupProtectionEnabled>false</BackupProtectionEnabled>
    <BackupProtectionPeriod>1</BackupProtectionPeriod>
    <TenantType>
        <StandaloneTenant>
            <TenantCredentials>
                <Username>AudiEnterprises-FFFTIBI541</Username>
            </TenantCredentials>
        </StandaloneTenant>
    </TenantType>
</CloudTenant>   

```

> Pro-tip, why not try the new JSON format!
> 
> Just add Accept: application/json to your HTTP request to the same GET url

```
{
  "Password": "",
  "Description": "We are going to update the description...",
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
    removed.....
  ],
  "Href": "http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants/95c26e34-1b8e-456e-aa21-c527bda7e311?format=Entity",
  "Type": "CloudTenant"
}   

```

