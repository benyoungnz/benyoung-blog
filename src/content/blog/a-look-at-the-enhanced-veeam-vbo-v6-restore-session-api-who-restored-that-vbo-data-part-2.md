---
title: 'A look at the enhanced Veeam VBO v6 Restore Session API - Who restored that VBO Data part 2' 
description: 'I posted a couple of weeks ago about different ways a customer could get
visibility into who was restoring data with the global admin account when the'
heroImage: '/content/images/2022/04/api-audit-restore.jpg'
slug: 'a-look-at-the-enhanced-veeam-vbo-v6-restore-session-api-who-restored-that-vbo-data-part-2'
pubDate: '2022-04-21T10:02:26.000Z'
tags: ["vbo", "api"] 
categories: ['veeam']
author: ["ben"]
---

I posted a couple of weeks ago about different ways a customer could get visibility into who was restoring data with the global admin account when the backups are hosted with a service provider. You can check this [post out here for part 1](https://benyoung.blog/who-restored-that-veeam-backup-for-microsoft-365-data-a-look-at-what-a-service-provider-can-provider-clients-in-a-multi-tenant-environment/) . 

The cool thing is Jorge de la Cruz picked up on my tweet and we had a bit of back and forth about API usage, problem being at the time we were on version 5, and the data was much the same, we loose what end user/terminal was utilising the global admin account, even when we track this via the VBO Audit API. 

Fast forward to today and we just upgraded our service provider environment to version 6. Let's take a look at the API usage now see if this returns what we need.

## Perform a restore

I will keep this one simple and just download some emails from my inbox to the desktop of this client machine. A point to note is this machine I am restoring from is completely external to any of the hosting platform, off domain and just a random development machine I have.

We access this multi tenant environment via the Cloud Connect gateways which proxies traffic after we have authenticated with Microsoft 365 services. This is with the global admin (or account with these permissions) and because of this is the purpose of this post to see WHO and from WHERE the data was restored from and elevated themselves to admin.

Via the explorers i select some test emails and download them to the desktop of this remote machine.
![](/content/images/2022/04/image-25.png)![](/content/images/2022/04/image-26.png)
That will then fire up a restore session via the cloud gateways and we will see the restore session on the VBO server which we host on the service provider side. Hopefully with the username and hostname of this remote development machine of mine.

## API Usage

Right so the process is as follows

- Get token from the VBO API

Below calls assume you have enabled the API and can either access remotely or locally, by default the Veeam Microsoft 365 API listens on port 4443 so https://hostname:4443/{version}/{endpoint}

### Get Authentication Token

> POST to {server:port}/v6/token

Note that this is the only non-json payload we will be sending, it's a form payload you need to send

- grant_type = password
- password = yourpassword
- username = youruser

This will return a JSON payload with an access_token (big long string value) copy this entire thing to a variable if in code, or just copy it if your messing about in postman.
![](/content/images/2022/04/image-27.png)
From here on out you will need to add this value to any requests made to the API via an HTTP header as below.

> Authorization: Bearer {yourtoken}

### Getting restore sessions

For this we will be performing some simple get queries (remember your authorization header as above)

These endpoints were in v5, but the initiatedBy was the organisation (spoiler: no change here unfortunately :(... ) by the clientHost is new.

> GET to {server:port}/v6/restoresessions

Let's digest this payload a little
![](/content/images/2022/04/image-29.png)
Bubbles

1. Some pagination links, note that the limit is 30, this is the default you can request more per page by adding a querystring value of ?limit=200 for example for 200 at a time
2. Name of the restore, useful to know if its exchange, onedrive etc, also point 4 is the type of restore, VEX = Veeam Exchange Explorer, there are unique values for Sharepoint, Teams and OneDrive
3. The organisation identifier, if you are wanting to wrap some services around this and deliver the data to your own portal you will want to filter by this value in your code
4. Type of restore operation, per point 2 above
5. Initiated by - it SHOULD be the user initiating the restore, which if everything is hosted on premise and not via the cloud connect gateways it would be the user context of the user with the explorer open, such as "benyoung"
6. Client host detail, this is split into two items BXYDEV01 is my remote machine name, bit in brackets (via: {ip address}) shows the gateway address of our service provider cloud gateways - not the client address of my remote machine.

> Pro tip: Other than adding the limit query string to return more per page you can also add ?**startTimeFrom**=<startTimeFrom>&**startTimeTo**=<startTimeTo>&limit=100
> 
> The dates/times are in UTC .

Right so what's better and what's the same?

- We now have an originating machine name, this is useful. End users could have the explorers on their own machines and perform restores here instead of via a shared tool environment
- The Initiated by still shows the organisation name and not the user, hopefully we can get this added at some point then a shared tool server could be used

### Getting restore events for each session

Diving further in on each restore session result what else do we see you will note that there is an events link, if you follow this and grab the data what do we get?
![](/content/images/2022/04/image-30.png)
Fire the query off /events

> GET to {server:port}/v6/restoresessions/{restore-session-id}/events

You will now get a paginated result view of EVERYTHING that occured with the restore session, pretty handy.

It starts out with a "restore session started" event
![](/content/images/2022/04/image-31.png)
And if we scroll down you will see you get a pretty nice level of detail such as opening a specific folder on the explorers, in my case the Testcloudspace folder.
![](/content/images/2022/04/image-32.png)
And then a bunch of individual line items detailing exactly what i restored. Points of note below;

- The source = path in my mailbox, this will be different for sharepoint and onedrive restores
- A note around what was restored and where under title
- Some additional detail in the message field
- Heaps of other juicy metadata like size of restored data, type of data, status, start and endtimes etc etc

![](/content/images/2022/04/image-33.png)
You will note in the payload there an eventid and a endpoint listed for each of these items. 

You can open up {server:port}/v6/restoresessions/{restore-session-id}/events/{event-id} if you want just this record. It does not return you any additional data that what is on the paginated event session log though.

## Summary

So, some nice improvements here for v6, specifically the clientHost now being on the restoresession object is a great addition.

What would be good is if the clientHost property on the restoresession object included the user as well, or the initiatedBy was more like what it is on the on-premise install where you get the user instead of it simply being populated by the organisation.

### Do the enhanced v6 api endpoints makes this usable? 

Absolutely, with the clientHost now coming through - for organisations requiring this level of auditabilty around restorations I am sure they can live with having each restore operator having their own explorers, or a laptop or their own VDI for example.

Hopefully at some point in a future VBO update we can see some enhanced remote data coming through and this will become even better for service providers to surface this data to their clients.

### Where to from here?

I hope to use this in the near future to allow customers to set up custom trigger rules on our portal much like how the audit API works and then monitor this data and send out meaningful reports as required. 

The real end goal here is for me to build out a complete restore environment via our web portal leveraging the VBO restore API's this way I can audit what user is performing what actions and align restore session data from the above apis with audit events on our api/portal.

