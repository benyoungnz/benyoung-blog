---
title: 'Extracting Veeam Compression and Dedupe Ratios from Backup using Powershell' 
description: 'I found myself recently wanting to pull out a report from a Veeam backup job to
get the Deduplication and Compression ratios for a service review that'
heroImage: '/content/images/2021/07/Screen-Shot-2021-07-13-at-2.41.26-PM.png'
slug: 'extracting-veeam-compression-and-dedupe-ratios-from-backup-using-powershell'
pubDate: '2021-07-13T02:42:36.000Z'
tags: ["veeam"] 
categories: ['veeam']
author: ["ben"]
---

I found myself recently wanting to pull out a report from a Veeam backup job to get the Deduplication and Compression ratios for a service review that was being completed around the true cost of a GB of backup storage. 

In Veeam you will be familiar with the following window (found by viewing the properties of the files on disk)
![](/content/images/2021/07/image-16.png)![](/content/images/2021/07/image-15.png)
The data is pretty useful but when you have a large backup job it could take some time to manually pull out all the data. 

With this you could pipe it off to csv etc in Powershell and do what you need. Or i actually had a plan to run this daily and plot the data over time in InfluxDB/Grafana and do something nifty with it, perhaps in a followup.

If I run my script the output is the same as the numbers via the Veeam console.
![](/content/images/2021/07/image-17.png)
So, if you need this data here goes the script, adjust as required (job name is on line 1...)

