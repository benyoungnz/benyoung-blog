---
title: 'Find stale disks on Veeam Replicas using PowerShell' 
description: 'When you have a lot of operators in your virtual environment, in our case via
the customer self service portal production virtual machines that are re'
heroImage: '/content/images/2021/07/powercli-replica-difference.png'
slug: 'find-stale-disks-on-veeam-replicas-using-powershell'
pubDate: '2021-07-22T23:09:53.000Z'
tags: ["veeam", "powercli", "powershell"] 
categories: ['veeam']
author: ["ben"]
---

When you have a lot of operators in your virtual environment, in our case via the customer self service portal production virtual machines that are replicated have disk layouts that change and become out of sync with their replica - specifically where a disk was removed the replica will retain the additional disk. 

A simple PowerShell script can take care of this and highlight replicas that can be removed and re-seeded. You will need the PowerCLI from VMware installed on the machine you plan to run it from.

The script does the following

- Connects to all of your vSphere environments, in our case we have 2 geographically seperate environments and customer can opt to replicate to the other region if they wish.
- Once connected it grabs a list of ALL virtual machines in your environment at all locations, pulls the name as well as the hard disk count (via Get-HardDisk)
- It additionally filters this matching the pattern *_replica *(you can change this if you use a different pattern)*
- Loops through all of the replicas and attempts to find the matching production VM (the one without the _replica suffix)
- Compares the total number of disks on each and if it differs then alerts you in red. I also spit out the OK ones but you could omit this from the log if you only wanted to see the ones with differences.
- If the matching production VM cannot be found then it will also log that it could not find it

The result is something like the following (blurred out the sensitive info)
![](/content/images/2021/07/image-18.png)
This could easily be automated into a report but adding a simple mail function or even better a webhook into teams/slack/service desk. 

Here you go, enjoy! [Link to the code](https://gist.github.com/benyoungnz/0bc6c69b6326129f2e9bcca6bbfcd678), or embedded below.

