---
title: 'Veeam API JSON Support in Update 4'
description: 'While testing our integration library and immediately running into issues I discovered some weirdness if the json accept header was specified (anywhere) that some requests failed it got me thinking. What if they now supported json, wouldnt that be nice! No more clunky XML to deal with.'
heroImage: '/content/images/2019/01/Screen-Shot-2019-01-21-at-12.54.38-PM.png'
slug: 'veeam-api-json-support-sort-of'
pubDate: '2019-01-20T23:56:41.000Z'
tags: ["veeam", "api", "json"] 
categories: ['veeam']
author: ["ben"]
---

With the rollout of Update 4 imminent I was keen to see what was new, unfortunately this meant manually via Postman as the documentation is not being released until GA.

While testing our integration library and [immediately running into issues I discovered some weirdness](/node-root-does-not-exist-veeam-api-with-update-4/) around if and json accept header was specified (anywhere) that some requests failed it got me thinking.

What if they now supported json, wouldn't that be nice! No more clunky XML to deal with.

## They do!

For GET requests anyway, yet to test/refactor POST requests. UPDATE: POST/PUT [also accepts the new JSON payloads](https://benyoung.blog/trying-the-new-json-payload-super-powers-in-veeam-update-4/), just remember to add the Accept Header or it will throw errors even if you have the content-type set to json

By default it delivers XML if you set a wildcard Accept header.

Here is a super simple example getting a list of your backup servers, but works elsewhere.

> GET /api/backupServers with application/xml (or */*)

```
<?xml version="1.0" encoding="utf-8"?>
<EntityReferences xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Ref UID="urn:veeam:BackupServer:abb77af8-28dd-49c0-97ff-580b719bdbfe" Name="localhost" Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/backupServers/abb77af8-28dd-49c0-97ff-580b719bdbfe" Type="BackupServerReference">
        <Links>
            <Link Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/backupServers/abb77af8-28dd-49c0-97ff-580b719bdbfe/jobs" Type="JobReferenceList" Rel="Down"/>
            <Link Href="http://cloudconnect1.testcloudspace.co.nz:9399/api/backupServers/abb77af8-28dd-49c0-97ff-580b719bdbfe/repositories" Type="RepositoryReferenceList" Rel="Down"/>... etc etc

```

> GET /api/backupServers (with application/json specified in accept header)

```
{
    "Refs": [
        {
            "Links": [
                {
                    "Rel": "Down",
                    "Href": "http://cloudconnect1.testcloudspace.co.nz:9399/api/backupServers/abb77af8-28dd-49c0-97ff-580b719bdbfe/jobs",
                    "Type": "JobReferenceList"
                },
                {
                    "Rel": "Down",
                    "Href": "http://cloudconnect1.testcloudspace.co.nz:9399/api/backupServers/abb77af8-28dd-49c0-97ff-580b719bdbfe/repositories",
                    "Type": "RepositoryReferenceList"
                },
                {
                    "Rel": "Down",
                    "Href": "http://cloudconnect1.testcloudspace.co.nz:9399/api/backupServers/abb77af8-28dd-49c0-97ff-580b719bdbfe/externalRepositories",
                    "Type": "ExternalRepositoryReferenceList"... etc etc

```

Cool right? No doubt more details will be released at GA when we have the documentation and release notes.

