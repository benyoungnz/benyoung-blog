---
title: 'Backblaze B2 s3 with Veeam Backup for Office365'
description: 'Backblaze B2 storage is now s3 api compatible. Want to use this with Veeam Backup for Office365 as an object target. The good news is, you can!'
heroImage: '/content/images/2020/05/backblazeb2-veeambackupforoffice365.jpg'
slug: 'backblaze-b2-s3-with-veeam-backup-for-office365'
pubDate: '2020-05-05T09:30:29.000Z'
tags: ["backblaze", "objectstorage", "vbo", "office365"] 
categories: ['veeam']
author: ["ben"]
---

So.... today I saw an email from Backblaze saying they [now have native s3 api support](https://www.backblaze.com/blog/backblaze-b2-s3-compatible-api/)! I already use their personal and B2 backup services with absolutely no complaints.

Why not try this out with some Veeam Backup products to see if it all fires up, starting with Backup for Office365. 

**TLDR;** it works great! no issues whatsoever, up and running in less time than you can make a cup of coffee.

If you do not already have a Backblaze B2 account - [create one here](https://www.backblaze.com/b2/s3-create-acct/), *first 10gb is free* so you can kick the tires without even entering a credit card.

Now you need to create a new bucket. If you already have some you will notice that there is a blank entry next to endpoint. It instructs you that:

> Buckets created before May 4, 2020 cannot be used with our S3 Compatible APIs.

All good, create a new one
![](/content/images/2020/05/backblaze-create-bucket.png)Creating a new bucket in Backblaze
The bucket with then appear in your list - note the new s3 endpoint, you will need this when you get into Veeam Backup for Office365
![](/content/images/2020/05/backblaze-bucket-created.png)
Now, what good is a bucket with out anyway to access it. Create some application keys/credentials - head over to the App Keys settings in Backblaze and hit create new. Fill our your desired settings and as good practice secure it out to only allow access to your new bucket. 
![](/content/images/2020/05/backblaze-createappkey.png)
Your new application key will appear, save these somewhere secure as they only appear once. You will need these in Veeam when creating the repository.
![](/content/images/2020/05/backblaze-appkeycreated.png)
Jump into Veeam Backup for Office365 Console- time to create a new Backup Repository. Make your way into the Backup Infrastructure panel and Add a new backup repository.

Give it a meaningful name
![](/content/images/2020/05/veeam-createnewobjectrepo.png)
Then select the S3 compatible option
![](/content/images/2020/05/veeam-createnewobjectrepocompatible.png)
Now enter the s3 endpoint copied from the Backblaze panel into the Service endpoint on the Veeam wizard. 

Then Select add credential, entering the App Key ID and Secret created and saved securely earlier.
![](/content/images/2020/05/veeam-createbackblazecredentials-1.png)
Hit next with the new credentials selected - 

Your bucket(s) will now show, select the destination bucket - in my case VeeamBackupO365 - now you need to browse a folder for Veeam to upload backup data too. If this is a new repository you will need to create one like I did below called Data.
![](/content/images/2020/05/veeam-createfolderinbackblaze.png)
If you jump into Backblaze after hitting next you can see Veeam has created the Data folder and some parent folders.
![](/content/images/2020/05/backblaze-newlycreatedfolder-1.png)
Select desired retention settings, and complete the wizard
![](/content/images/2020/05/veeam-selectretentionsettings.png)
Your new repository is ready for use and can be used for backup job targets.
![](/content/images/2020/05/veeam-newrepocreatedlist.png)
Time to create a new backup job. For this demo I am going for a backup of just my user and of course target the new backblazeb2-s3 backup repository. Work through the wizard.
![](/content/images/2020/05/veeam-newbackupstep1.png)Giving the backup job a name![](/content/images/2020/05/veeam-newbackupstep2-selectusers.png)Select entire organisation or desired users/groups and what to process (Exchange, OneDrive and Sharepoint)![](/content/images/2020/05/veeam-newbackupstep3-selectrepo.png)Select the backblazeb2-s3 backup repository
Now you can run the job! Off it goes.
![](/content/images/2020/05/veeam-jobfirstrun.png)Job first run
And you can see the bucket start to have data ingress. 
![](/content/images/2020/05/backblaze-datainbound.png)
And there you have it. Fully functional Backup for Office365 using Veeam and Backblaze B2 storage.

