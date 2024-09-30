---
title: 'Veeam Job Disk Usage Report and Alert when threshold reached' 
description: 'Need to monitor Veeam jobs and their disk usage? There are a few reasons why you
may need this - for me I wanted to have alert when a job was over a c'
heroImage: '/content/images/2022/03/veeam-backup-size-threshold.jpg'
slug: 'veeam-job-disk-usage-report-and-alert-when-threshold-reached'
pubDate: '2022-03-28T22:46:54.000Z'
tags: ["powershell"] 
categories: ['veeam']
author: ["ben"]
---

Need to monitor Veeam jobs and their disk usage? There are a few reasons why you may need this - for me I wanted to have alert when a job was over a certain total disk size so I could start splitting them out into smaller jobs. 

You may have a different reason but here is a simple script you can use to run every day (or whenever) that will send you a nice report IF any jobs are over your configured threshold, otherwise it wont send anything. also.... we haven't had a PowerShell Tuesday for a while.

### Example report 

*From my lab (set to 100gb), note my backup server is cleverly named "BackupServer" your actual server will end up here*
![](/content/images/2022/03/image-8.png)
### The script

    .gist {max-width:100%; overflow:auto;margin: 0 auto;}

Out of the box all you really is to edit the top 10 lines of the script

- $alertThresholdGB = the GB amount if a job reaches you want to alert on, below this will be ignored
- $emailSettings = where and how you want the email routed, note that the subject has a token {{VBRServer}} which will get replaced with the name of the VBR session this report is for, handy if you want to run this from multiple backup servers

### How is the storage measured

So line 14 is pretty much where it all happens. First we;

1. Trigger **Get-VBRBackup** to get all backup jobs, you could filter here if you like or enter a single backup job if you only want to monitor one job
2. For each of the jobs we then use the **GetAllStorages()** function and sum all of the data into a custom object alongside the job name 

That's all there is to it. Enjoy! 

