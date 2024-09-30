---
title: 'Machine learning on your Veeam backups? Sure! via the Data Integration API'
description: 'Being able to reuse your backup data is a pretty powerful thing.  Not only does it allow you be non-impactful to a production system but it also allows you to open up a complete backup chain and perform these tests on any restore point you hold. '
heroImage: '/content/images/2020/06/1280.png'
slug: 'machine-learning-on-your-veeam-backups-sure-via-the-data-integration-api'
pubDate: '2020-06-15T00:28:42.000Z'
tags: ["veeam", "dataintegrationapi"] 
categories: ['veeam']
author: ["ben"]
---

Being able to reuse your backup data is a pretty powerful thing.  Not only does it allow you be non-impactful to a production system but it also allows you to open up a complete backup chain and perform these tests on any restore point you hold. 

Most enterprises would have years worth of restore points. Imagine what you could do here. Back date file system indexing, additional virus scanning, various machine learning applications, forensic analysis, GDPR auditing, compliance ... the list goes on.

If you have Veeam Backup & Replication and want to do some things with your data - I have a [starter script on a previous post](/getting-started-with-the-veeam-data-integration-api/) to get you going. 

## Demo

> Looking for** NSFW content**... in this case a we have made it SFW by looking for a "Dog" ;-) 

*There are notes below the video detailing a bit of what is going on here.*

Notes:

- Uses the Veeam Data Integration API to mount a backup, loop through each of the objects (virtual machines) in the job, grabs the latest restore point and presents the data to a "processing" machine
- The Processing machine grabs the files and passes any images up to a quick and dirty locally hosted ML.NET Web API (using [YOLOv3 - You Only Look Once](https://pjreddie.com/darknet/yolo/))  to perform object detection on the image
- The web service stores the result in a database along with Veeam metadata (restore point id, job name etc), passes back any of the findings to the Powershell script, if the script detects Dog then pops the offending pooch into a browser window (could be to Slack, MS Teams, Ticketing systems etc)	

