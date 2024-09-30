---
title: 'Service Provider Console cant connect to Cloud Connect Server, invalid user or permissions' 
description: 'Quick one - after having just added some new servers in the lab with Veeam on
them and Server 2022, I went to add this server into the Service Provide'
heroImage: '/content/images/2023/01/dcom-permission-error.jpg'
slug: 'service-provider-console-cant-connect-to-cloud-connect-server'
pubDate: '2023-01-15T23:25:42.000Z'
tags: ["serviceproviderconsole"] 
categories: ['veeam']
author: ["ben"]
---

Quick one - after having just added some new servers in the lab with Veeam on them and Server 2022, I went to add this server into the Service Provider console and got the following message

> Failed to connect to the server. Specified user is invalid or does not have enough permissions on the server.

![](/content/images/2023/01/image.png)
After the usual checks, double checks around user being a local admin, password is valid, firewall etc etc I took at look in the event log on the new Veeam Cloud Connect server

> The server-side authentication level policy does not allow the user XXXX from address XXX to activate DCOM server. Please raise the activation level at least to RPC_C_AUTHN_LEVEL_PKT_INTEGRITY in client application

![](/content/images/2023/01/image-1.png)
A quick search and you come across [this article from Microsoft](https://support.microsoft.com/en-us/topic/kb5004442-manage-changes-for-windows-dcom-server-security-feature-bypass-cve-2021-26414-f1400b52-c141-43d2-941e-37ed901c769c ), titled;

*[KB5004442](https://support.microsoft.com/en-us/topic/kb5004442-manage-changes-for-windows-dcom-server-security-feature-bypass-cve-2021-26414-f1400b52-c141-43d2-941e-37ed901c769c)—Manage changes for Windows DCOM Server Security Feature Bypass (CVE-2021-26414)*

The recommendations in there are to obviously update with the DCOM Hardening fix but has some other workarounds if this is not possible with some registry changes directly.

Checking the client side (The service provider console side) I noticed that as this is just a poor little lab server I have here that gets almost no attention, the automated Windows updates had stopped, I typically let my lab auto install Windows updates, therefore it did NOT get the DCOM security updates, like the other end had (Cloud Connect end).

Then a few minutes an hour later we were up to date.
![](/content/images/2023/01/image-2.png)
Jumping back into the Service Provider Console again, adding the Cloud Connect server via System configuration it wen't through without any problems.. well that was simple.
![](/content/images/2023/01/image-4.png)
Hopefully something you will not come across in production as I am sure/hope you have a regular patching schedule but this can easily happen in the lab.

