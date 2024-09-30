---
title: 'Service check and restart after Veeam Backup job has run (post-thaw)' 
description: 'I came across an set of application servers in an environment which were not
fault tolerant at all to service disruption at all. Most often caused aro'
heroImage: '/content/images/2019/02/thaw.jpg'
slug: 'serivce-health-check-after-veeam-backup-job-has-run'
pubDate: '2019-02-26T21:05:34.000Z'
categories: ['veeam']
author: ["ben"]
---

I came across an set of application servers in an environment which were not fault tolerant at all to service disruption at all. Most often caused around the time the virtual machine was backed up, in particular when the snapshot was taken or committed as part of this VM backup which is pretty common. 

This post is about the script I put together to check server health which is triggered by Veeam Backup and Replication Server on the post-thaw event. More on that *at the bottom of the page*. 

### What does the script do?

Firstly, its a Powershell script.

1. Takes an array list of service names to monitor
2. Loops through and checks the status of each of them and performs an appropriate action
3. Logs results and status to a Slack channel so the application team can monitor easily

### Scenarios tested with each service

1. If **state == STOPPED**, starts the service, throws warning to log if unable to start
2. If **state == RUNNING**, leaves everything as-is, logs result
3. If **state is not STOPPED or RUNNING** then logs warning to be checked out as its likely in a bad state *(stuck in stopping or starting)*, needs a human to check it out
4. If service not found then it logs this as a warning stating the service was not found on the system

### Config

I have defined a config section at the top allowing for it to easily be adapted. One is for Slack if you want to use that and the other for the services you wish to monitor.

#### Slack

- $slackBotName = the name of the bot posting to Slack
- $slackKey = you slack generated webhook id
- $slackChannel = which channel you want to have the both post to

#### Services

- $servicesToMonitor = string array of service display names
- $servicesTimeout = default amount of time you want the desired service state

### The Script

## Veeam Integration

Now you have the script you can configure it on your backup job under the application settings.

Upload the script to a location on your B&R server, something like c:\Scripts\ApplicationAwareProcessing

Follow the [steps here from Veeam](https://helpcenter.veeam.com/docs/backup/vsphere/vm_copy_vss_scripts.html?ver=95u4)  (remember to put your script on the B&R Server)

Now when you run the job you will see in the log it running the post-thaw event and the output come across to your slack channel

```
[CHCSQL] 12:08:35 PM - Xbox Live Auth Manager service was stopped, we will start
[CHCSQL] 12:08:36 PM - Windows Search service was stopped, we will start
[CHCSQL] 12:08:37 PM - ERROR - Windows Search could NOT BE STARTED and needs to be investigated
[CHCSQL] 12:08:37 PM - WARNING - MyServiceNotInstalled service was not found on this system

```

