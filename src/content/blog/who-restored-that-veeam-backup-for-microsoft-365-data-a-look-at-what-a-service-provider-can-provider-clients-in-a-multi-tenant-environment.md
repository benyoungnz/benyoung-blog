---
title: 'Who restored that Veeam Backup for Microsoft 365 Data?! A look at what a Service provider can provider clients in a multi-tenant environment' 
description: 'When customers restore data out of their Backup for Microsoft 365 tenancy that
we host as a Service Provider in our multi-tenant environment, often th'
heroImage: '/content/images/2022/04/Who-Restored-that-VBO-Data.jpg'
slug: 'who-restored-that-veeam-backup-for-microsoft-365-data-a-look-at-what-a-service-provider-can-provider-clients-in-a-multi-tenant-environment'
pubDate: '2022-04-12T01:05:25.000Z'
tags: ["vbo", "api"] 
categories: ['veeam']
author: ["ben"]
---

When customers restore data out of their Backup for Microsoft 365 tenancy that we host as a Service Provider in our multi-tenant environment, often they want to keep the security team happy in knowing who performed the restoration tasks via the elevated service account that is required to enact the restore and access the tenancy.

I did a bit of investigation for a customer who wanted to know exactly what they may be able to monitor and audit to ensure they know who and where their data was being restored from.

I have broken down the review into two main sections

- Log monitoring (client and service provider side)
- Leveraging the Veeam Microsoft 365 Audit API

### Customer site log monitoring

By this I mean when the customer has the explorers installed on premise and are using our cloud gateway infrastructure to proxy through to our multi-tenant Veeam Backup for Microsoft 365.

**Explorer Logs**

So, what can we do here. If you open up the log directory for say the Exchange Explorer (typically *C:\ProgramData\Veeam\Backup\ExchangeExplorer\Logs*) and load up the tenant lets take a look at what we see.

Right at the start of the log session we see two things, other than the timestamps of course

- The server that this was loaded from
- The user account that loaded the explorer

Good start
![](/content/images/2022/04/image.png)
Ok, now what about when we login via the modern auth flow out on O365.

So we see it open up the service provider tenant, and the validation of the service account. 

Note though a different processid, would be useful if this was all assigned to the session 34688 in my example that was when I opened the account up. So this would only be definitively be me if there were no other sessions opened at the time I was in here. 
![](/content/images/2022/04/image-1.png)
Then if we actually restore data, in this example I downloaded the data directly to my desktop but the same is generated for injecting. Again an internal processid not via the 34688. still useful but same as above applies.
![](/content/images/2022/04/image-3.png)
Ok, so this could be useful if we consumed these log files up into a SIEM or syslog server or similar, we would then be able to correlate restore events, or monitor these events and trigger alerts.

However the pathing of what was restored was a little vague, I can see the msg file name and what folder it was restored from but not who's mailbox this folder/msg was from. 

Now, that was also with** Default logging,** what happens if we use extended logging, do we get anything else that could be useful? Let's enable it and take a look.

Under General Options > Advanced on the explore select this option
![](/content/images/2022/04/image-4.png)
all of the start of the log file is pretty much the same in terms of information that might be useful. But.....

We now get much more meaningful data of what the data was, now we get the mailbox and path where the item resided. In this case 

- Ben Youngs mailbox
- Inbox
- Testcloudspace Folder

![](/content/images/2022/04/image-5.png)
Ok thats good.

### Service Provider side log monitoring

So given the actions above what information do we hold that might be useful for us to monitor and be able to provide to the customer?

The Veeam.Archiver.Service*.log files contain some information but nothing useful, we can see the organisation being validated, this could be useful to trigger a "someone just validated your account against your tenancy" at a minimum
![](/content/images/2022/04/image-6.png)
But it doesn't say who or what validated it. Still, this could be handy.

I checked a bunch of other VBO log files and even the local Exchange Explorer and B&R logs, nothing I could find that may be useful.

### Log file monitoring summary

- Monitoring the client side logs alone does give us some useful information, but extended logging should be enabled to get the most detailed information
- However, if more than one user were opening the explorer at the same time we have no way to track process wise which "user" did the restoring, or in the case where there are multiple restores occurring at once we don't know who did what
- Having the tools on individual workstations could get around this but would become more of a log monitoring nightmare
- The service provider side doesn't give us much other than ability to 

### Leveraging the Veeam Backup for Microsoft 365 Audit API

I have [covered this topic before](https://benyoung.blog/get-a-notification-when-restricted-user-data-is-accessed-in-veeam-backup-for-office365/) but starting from v5 of this product there is an Audit API which can be configured to send alerts when certain data is either accessed or restored. I.e alert security team if CEO mailbox is touched.

I will skip the part where i show you how to configure it again however you can see [part 1](https://benyoung.blog/audit-api-notification-setup-in-veeam-backup-for-office365/) and [part 2](https://benyoung.blog/get-a-notification-when-restricted-user-data-is-accessed-in-veeam-backup-for-office365/) here.

With it now configured to email me whenever my mailbox data is accessed, let's perform the same restore from the client side explorers.

This is the alert that was generated for a single email restore
![](/content/images/2022/04/image-7.png)
Useful, but.. (there is always a but)

- Point 1 shows the organisation (more on this in a minute)
- Point 2 / initiated by would normally show you the user enacting the restore i.e what we saw on the client side logs mymachine-or-domain\useraccount but when accessing a multi tenant environment it just injects the organisation identifer.. not so useful.

The other point to consider here is that as it stands today the Audit API can only have a global destination for audit reports. This means that the service provider would need to capture all the emails generated from the system and route them accordingly either using email rules on the mail server which is simple enough or programatically fetch them and sort them out that way.

All do-able, and again could be useful to the client - this could trigger another event to them saying "*someone* restored some data" along with "*someone* accessed your tenancy" via the vbo server logs this could be used to then cause an action on the client side collection to work out that "*someone*"

### Closing thoughts

I think it would be useful for Veeam to invest some time covering this gap off, the on-premise single tenant install has all the tools you need to capture the information needed around who restored what. 

It would be as simple as (i say this without context of how this works under the hood) - let's rephrase to be "It would be useful if..."

- In the client logging show the user context for the restore operations like something like *[machine\user Restored Ben Young\Inbox..... .msg]*, or align the process id's to match the session on the explorer
- Bringing through the user on the client side to the Audit API so we get the same experience as if the VBO server was installed on premise and not just filled with the organisation identifier

