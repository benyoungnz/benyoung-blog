---
title: 'VBO v4 API Organisation UsedRepositories Performance'
description: 'The API in version 4 of the API appears to have been significantly improved. I have seen dramatic improvement of 300+ seconds per call down to 10s...nice.'
heroImage: '/content/images/2020/04/VBO-Syslog-1.png'
slug: 'vbo-v4-api-organisation-usedrepositories-performance'
pubDate: '2020-04-01T08:25:00.000Z'
tags: ["veeam", "vbo", "api"] 
categories: ['veeam']
author: ["ben"]
---

One of the things I had been battling with Veeam Backup for Office365 version 3 was the performance of various endpoints in the API. Namely the [/Organizations/{OrganizationId}/UsedRepositories](https://helpcenter.veeam.com/docs/vbo365/rest/get_organizations_id_usedrepositories.html?ver=40) endpoint which we use for our hourly billing engine. For small <1TB repositories this was generally "acceptable" but anything bigger than this mileage varied... a lot.

To cater to the large repositories I had to increase the default HTTP request timeout in .NET out to 8 minutes. It was also getting to the point that our hourly job which sequentially ran through the organisations was running anywhere from 15 minutes right through to 50 minutes.... pretty close to our "hourly" window so I was about to start refactoring it to fire batches off into different threads to make it complete faster.

We upgraded to version 4 yesterday, I checked the logs post-change to ensure systems were operational and I was blown away.

Check this out - literally brought a tear to my eye.

Below is my Syslog output direct from the billing engine of a large-ish ~16TB client (3 repositories, all local, moving to object now we are v4). ~300s down **significantly**. It has settled on pretty much ~15s on average!
![](/content/images/2020/04/VBO-Syslog.png)Syslog example for one tenant, signifiant improvement.
And this is a background job log for all tenants. Down to less than 5 minutes...
![](/content/images/2020/04/VBO-Hourly-Job.png)Job history drop in total duration

