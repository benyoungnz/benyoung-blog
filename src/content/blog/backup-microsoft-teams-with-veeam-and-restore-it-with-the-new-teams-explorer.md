---
title: 'Backup Microsoft Teams with Veeam and Restore it with the new Teams Explorer'
description: 'Veeams new Teams Explorer which enables you to browse your backup and restore missing content of a team, download content easily which is very helpful if you just need the files you name it. It also has the ability to restore the team and associate metadata (or channels).'
heroImage: '/content/images/2020/11/Teams-Explorer.png'
slug: 'backup-microsoft-teams-with-veeam-and-restore-it-with-the-new-teams-explorer'
pubDate: '2020-11-19T02:18:34.000Z'
tags: ["vbo", "teams"] 
categories: ['veeam']
author: ["ben"]
---

It has been another busy year for the Backup for Office365 team at Veeam. I have been playing around with the BETA which we get early access too as part of being a Veeam Vanguard.

The most notable new feature in this release is the support now to backup Microsoft Teams, well.... it already was if you were backing up Exchange, OneDrive and Sharepoint for your organisation. Getting the data back as a complete team was the tricky bit. 

Not anymore, there is a new Teams Explorer which enables you to browse your backup and restore a missing/changed content of a team, download content easily which is very helpful if you just need the files.... you name it. 

It also has the ability to restore the team and associated metadata (or channels).

I have created a new backup job and selected a demo team we can play around with
![](/content/images/2020/11/3-select-teams-to-backup.png)![](/content/images/2020/11/4-team-selected.png)
Now the job is setup, we can run the job to get the initial seed - you can see it pulled off O365 pretty fast and it dragged down data from our Demo Team
![](/content/images/2020/11/5-teams-job-run-3.png)
Let's have a look with the new Teams Explorer. You can see there is our team with the posts/files, below i am browsing a sub folder within the files of the General channel.
![](/content/images/2020/11/7-explorer-files-view.png)
This is mirrored on Teams itself
![](/content/images/2020/11/8-teams-files-view.png)
Let's delete something. How about all those CIO documents? Sure thing.
![](/content/images/2020/11/9-delete-cio-documents.png)
And here is that file folder after the delete - all CIO ****.pdf documents gone. 
![](/content/images/2020/11/10-cio-files-gone-1.png)
Time to get them back. In Veeam Backup for Office 365 I right click the job and explore, **make sure you select the "show all items that have been deleted by a user" **if your job has run since you remove it, otherwise it will not show the delete files.
![](/content/images/2020/11/11-start-explore-missing-files.png)
Now the explorer is open with show delete items enabled, you have a couple options.

If you know what is missing, you can simply navigate to the folder and select the files you want to restore and restore files.
![](/content/images/2020/11/12-select-missing-files-1.png)
Or, if you know someone had some fun in there and just want to get everything back you can do this at the parent files level which is what we will be doing here.
![](/content/images/2020/11/13-select-parent-files-restore-all.png)
You get some restore options, select them based on your preferences around versions etc.
![](/content/images/2020/11/14-restore-options.png)
The explorer will now compare production with your backup and based on your settings restore what's missing.
![](/content/images/2020/11/15-comparing-backup-vs-production.png)![](/content/images/2020/11/16-restore-summary.png)
As above, you will get a restore summary. Most were skipped as they are already there/current. But note the CIO **** documents, and the "8 objects restored" in the summary at the top.

Let's check Teams. All there, note the modified time is more recent than the originals as is the Modified by (the backup service account in this case).
![](/content/images/2020/11/17-files-back-in-folder.png)
So that is a basic file restore. But what if someone deletes an entire channel (or the Team?)

I will show you through restoring a channel within a team. It will restore all the tabs, files etc as at the latest backup. This demo channel has a single file in the files folder but also a custom website tab showing this blog.
![](/content/images/2020/11/18-beforedelete-websitetab.png)The website tab![](/content/images/2020/11/19-beforedelete-files.png)The video file
Now I will delete the channel from the Microsoft Teams app
![](/content/images/2020/11/20-delete-team.png)
You can see it has now gone from the channels list
![](/content/images/2020/11/21-only-one-channel.png)
Using the explorer, we will perform a similar action we did with the files, right click the channel in the Veeam Teams Explorer and click restore channel.
![](/content/images/2020/11/22-restore-channel.png)
Let it perform some magic, you will get progress along the way which is helpful if it is a large channel or team.
![](/content/images/2020/11/23-restore-progress.png)
Now back in Microsoft Teams channel list you can see the restored channel (with date suffix)
![](/content/images/2020/11/24-restored-channel.png)
And all of the metadata and files was restored as your left it so it picked up so our website tab and files
![](/content/images/2020/11/25-afterrestore-websitetab.png)Restored website tab ![](/content/images/2020/11/26-afterrestore-files.png)Restored video file
As you can see Veeam have been very busy. This is a great addition to the product and has been much anticipated.

