---
title: 'Hotfix for Inoperational RESTful API v1_3 
& 1_4 support with Veeam Update 4 RTM'
description: 'Last week was pretty frustrating, debugging and discovering an issue / new "feature" with JSON support which broke some things.
After resolving those I was still seeing having an issue with CloudTenant editing. '
heroImage: '/content/images/2019/01/VeeamModelCompare-1.png'
slug: 'hotfix-for-api-in-veeam-update-4'
pubDate: '2019-01-21T00:45:36.000Z'
tags: ["veeam", "api", "hotfix"] 
categories: ['veeam']
author: ["ben"]
---

Last week was pretty frustrating, debugging and discovering an issue / new "feature" with [JSON support which broke some things](https://benyoung.blog/node-root-does-not-exist-veeam-api-with-update-4/).

After resolving those I was still seeing having an issue with CloudTenant editing. 

You have a few options

- Wait for the new GA build (they built a new one with this hotfix included by the looks of the email from Gostev)
- Patch your RTM build (log a ticket with Veeam Support to receive the file) - there is a standalone hotfix available for fixing the API specifically.
- [Veeam KB2870](https://www.veeam.com/kb2870) - leave your code at latest and update the schema

After logging a support ticket with Veeam Support last week I was issued a hotfix which i can only assume was what was wrapped up into the new GA build.

## The API Hotfix

It only included a single file, **Veeam.Backup.Model.dll**

With the instructions

```
-Stop all Veeam services on SP EM Server.
-The following file should be replaced with the files from the fix archive:
    
1) C:\Program Files\Veeam\Backup and Replication\Enterprise Manager\Veeam.Backup.Model.dll - (it is advised to backup this replaceable file in the corresponding folder by copying it to another folder)

2) C:\Program Files\Veeam\Backup and Replication\Enterprise Manager\WebApp\Bin\Veeam.Backup.Model.dll (NOTE! DO NOT backup the .dll in this folder by renaming it. Old file must be moved outside this folder or WebUI ЕМ won't start )
    
-Start all Veeam services on EM Server again

```

## What did the API hotfix contain?

Being curious I did an assembly compare - surprisingly not a heap, literally two lines were added.

![VeeamModelCompare](/content/images/2019/01/VeeamModelCompare.png)

Obviously this is handled upstream somewhere so in a way good that they can allow different parts of the model to operate at different versions by the looks of it?

## KB2870 - v1_4 support

Some more information is starting to come through as they are releasing the documentation/changes which I will test. It seems you can operate at the 1_4 level (latest) and update your schema to match.

Tenant edit. GET request now returns a new tenant type block. Adding this block to PUT requests should allow functionality to work as intended:

```
<TenantType>
       <StandaloneTenant>
          <TenantCredentials>
             <Username>TENANT_NAME</Username>
          </TenantCredentials>
       </StandaloneTenant>
</TenantType>   

```

The element is described in the new XSD as follows:

<xs:element name="TenantType" type="CloudTenantType" minOccurs="0" maxOccurs="1"/>

For more information

[Link to KB2870](https://www.veeam.com/kb2870)

