---
title: 'Node [root] does not exist - Veeam API with Update 4'
description: 'Fired up some debugging and realised that most of the GET requests looked ok, but any of the POST and PUT requests started throwing HTTP 400 Bad Request Errors.'
heroImage: '/content/images/2019/01/VeeamCode.png'
slug: 'node-root-does-not-exist-veeam-api-with-update-4'
pubDate: '2019-01-20T23:40:14.000Z'
tags: ["veeam", "api"] 
categories: ['veeam']
author: ["ben"]
---

We have had the new Update 4 for Veeam Backup and Replication due to be released (tomorrow, 22nd Jan 2019)  for a couple of weeks now. As part of our normal process we have upgraded all internal systems and tested our platform against it. 

As soon as I spun up our cloud portal it was immediately obvious that something was not... quite.... right.

### Integration library at a glance

- A custom SDK/integration library written in c# (.NET framework)
- I make use of the excellent [RestSharp](http://restsharp.org/) library to do the heavy lifting of the http calls back and forward
- Has been up and running since Update 2, covering everything from self service virtual machine file level recovery to cloud connect tenant creation and management.
- We use this library primarily in our cloud management portal [MyCloudSpace](https://www.mycloudspace.co.nz/#/) as well as other internal systems

### What was wrong?

Fired up some debugging and realised that most of the GET requests looked ok, but any of the POST and PUT requests started throwing HTTP 400 Bad Request Errors.

Using Fiddler to act as a proxy between my development environment and the test Veeam systems allowed me to easily see the payloads going back and forth as well as re-issue requests to try and debug easily without making code changes.

#### Example - Create a Cloud Tenant

This example creates a basic Cloud Connect Tenant

- POST to [http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants](http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants)
- With an appropriate CreateCloudTenantSpec ([documentation here](https://helpcenter.veeam.com/docs/backup/rest/post_tenants.html?ver=95))

> Request

```
POST http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants HTTP/1.1
Content-Type: text/xml
Accept: application/xml, text/xml, application/json, text/json, text/x-json, text/javascript
Host: cloudconnect1.testcloudspace.co.nz:9399
X-RestSvcSessionId=YOURRESTTOKENHERE
accept-encoding: gzip, deflate
content-length: 719
Connection: keep-alive

<?xml version="1.0" encoding="utf-8"?>
<CreateCloudTenantSpec xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
... removed for readability.   
</CreateCloudTenantSpec>

```

> Response

```
HTTP/1.1 400 BadRequest
Content-Length: 125
Content-Type: application/json
Server: Microsoft-HTTPAPI/2.0
Date: Wed, 16 Jan 2019 04:23:32 GMT

{"FirstChanceExceptionMessage":null,"Message":"Node [root] does not exist.","StackTrace":null,"Status":null,"StatusCode":400}

```

> Error log on server

```

[16.01.2019 17:23:32] <62> Error    Failed to deserialize [POST] request to [http://cloudconnect1.testcloudspace.co.nz:9399/api/cloud/tenants] (Message: [<CreateCloudTenantSpec xmlns="http://www.veeam.com/ent/v1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
...remove for readability
[16.01.2019 17:23:32] <62> Error    </CreateCloudTenantSpec>]; Parameters: []) due to an exception.
[16.01.2019 17:23:32] <62> Error    Node [root] does not exist. (Veeam.Backup.Common.CAppException)
[16.01.2019 17:23:32] <62> Error       at Veeam.Backup.Common.CXmlHelper.GetFirstNodeByName(XmlDocument doc, String nodeName)
[16.01.2019 17:23:32] <62> Error       at Veeam.Backup.Enterprise.RestAPIService.CSmartDispatchMessageFormatter.TransformDateTimeInMessage(Message oldMessage)
[16.01.2019 17:23:32] <62> Error       at Veeam.Backup.Enterprise.RestAPIService.CSmartDispatchMessageFormatter.System.ServiceModel.Dispatcher.IDispatchMessageFormatter.DeserializeRequest(Message message, Object[] parameters)
[16.01.2019 17:23:32] <62> Error    Node [root] does not exist.

```

#### What was going on?

At this point it was anyones guess. Veeam for whatever reason have decided to not release the documentation for Update 4 until GA which leaves service providers in a bit of a tricky spot. Anyway, moving on.

At first I started to GET some existing tenants to check the schema - there were some differences between U3 and U4 *(more on this in another post)*. I grabbed the POST payload from one of the failed requests and biffed it into POSTMAN and hit go.

> Wait a minute, that worked - with an unmodified payload. Now I was curious.

I compared the requests in Fiddler and the only real difference I could see were

- Postman request only had application/xml set in the HTTP Accept Header
- RestSharp had the following Accept header application/xml, text/xml, application/json

#### Some testing

Using Fiddler I re-issued with edit the original POST request from our integration library but removed the application/json accept header. Boom - that worked.. but wait a minute, why should that matter?

By design *(after reading the HTTP specification)* the server should effectively look at this header as a "I prefer this first, then this, then this" etc - unless a qfactor is specified which I will not get into and was not present on the accept header anyway.

RestSharp can handle both Xml and Json content types which is why I am guessing they also append this at the end of the accept headers.

Playing a bit with the headers and trying different positions yielded the exact same result.

I tried this on a couple of other endpoints such as credential creation to prove my theory, which it did.

If application/json was present then the Veeam API blew up and returned an Bad Request with the same **Node [root] does not exist.** error no matter what the endpoint.

### The Fix

Easy enough, just override the Accept header for all calls being made by RestSharp to the Veeam Enterprise

Just add *req.AddHeader("Accept", "application/xml, text/xml");* to override the RestSharp default behaviour.

```
var req = new RestRequest("/api/cloud/tenants/{TenantId}/resources", Method.POST);
req.AddUrlSegment("TenantId", TenantID);
req.AddHeader("X-RestSvcSessionId", SessionToken);
req.RequestFormat = DataFormat.Xml;

// add the following
req.AddHeader("Accept", "application/xml, text/xml"); 

```

Now all outboud requests only have these content types.

Is the behaviour of putting other supported Accept types in the headers only a RestSharp thing?

I doubt it, but either way if you are using a helper library (or not) and receiving these error message then I would check what you are sending as an Accept header.

Veeam are clearying moderninsing their API which is fantastic - [more on json support here](https://benyoung.blog/veeam-api-json-support-sort-of/), but cleary there are some things that need addressing.

