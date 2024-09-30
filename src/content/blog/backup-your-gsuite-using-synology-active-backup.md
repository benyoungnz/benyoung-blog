---
title: 'Backup your G Suite using Synology Active Backup' 
description: 'There are many scenarios of why you  SHOULD  be backing up your Google GSuite -
anything from accidental data loss, malicious actor causing carnage, e'
heroImage: '/content/images/2021/02/Screen-Shot-2021-02-11-at-10.59.34-AM.png'
slug: 'backup-your-gsuite-using-synology-active-backup'
pubDate: '2021-02-10T18:00:00.000Z'
tags: ["synology"] 
categories: ['veeam']
author: ["ben"]
---

There are many scenarios of why you** SHOULD** be backing up your Google GSuite - anything from accidental data loss, malicious actor causing carnage, extended service outage requiring you to get access to some files or emails. You may want to hold additional copies for compliance or legal reasons, the list goes on.

So, how do you go about this? Well thankfully Synology make this really easy using their [Active Backup for G Suite.](https://www.synology.com/en-nz/dsm/feature/active_backup_g_suite) The next best bit is a very simple licensing model... there isn't one.... simply select the appropriately size NAS for your requirements and that is all there is too it - you are free to backup as many users as you want.

There is a range of configuration options around how many versions to retain, what do to about account discovery if new accounts come into your tenancy

You will need the following to get up and running

- Admin access to your G Suite 
- Compatible NAS (see below) but basically DSM >= 6.1-15217 and an x64 based model

You can check this page for an up to date list but as at writing these are the models that currently work with the product
![](/content/images/2021/02/supported-nas-models-backup-synology.png)Currently compatible Synology NAS models
Ok, now you have those pre-requisites sorted let's dive in.

Firstly you will need to activate the Backup for G Suite, pretty much run through the simple wizard it only takes a couple of minutes if that.
![](/content/images/2021/02/2-activate-activebackup.png)
Note you will need a Synology account if you do not already have one, you can create it as part of the activation process.

Once completed you will see the package activation confirmation 
![](/content/images/2021/02/3-activated-backup.png)
Now you need to setup the Google API's and configure your G Suite, effectively this creates a service context where  the Synology can reach in and grab the data it need from Gmail, Drive etc

There is an [excellent article and knowledge base document here](https://www.synology.com/en-global/knowledgebase/DSM/tutorial/Backup/How_to_obtain_authorization_from_Google_for_using_Active_Backup_for_G_Suite) detailing what you need to do, make sure you follow all the steps. See below for a curated list of key steps;

Firstly i added a new project under the developer console
![](/content/images/2021/02/4-add-gsuite-project.png)
Then I added the Admin SDK to the project
![](/content/images/2021/02/5-add-admin-sdk.png)
Key step here is to ensure you add all of the other required API's per that KB article. Your list should look like
![](/content/images/2021/02/5b-enable-other-sdks.png)
Now, there are a few other bits you need to click around delegation etc but follow the doc and you will get the bits you need to configure the rest of it (more on this later)

Now we need somewhere for the backup data to reside, I created a new shared folder as the target as follows
![](/content/images/2021/02/7-add-shared-drive-name.png)
I opted for encryption here, remember to save the encryption key securely somewhere for safe keeping.
![](/content/images/2021/02/8-add-shared-drive-encryption.png)
The summary of my new shared folder
![](/content/images/2021/02/9-confirm-share-settings-1.png)
Now you can get on with the setup and configuration using the Backup for G Suite application.

This is where you will feed in the following as step 1.

- Service key json file from your Google Developer Console
- Primary domain
- Admin email

Once this validates then you can get on with setting up your backup tasks.

Firstly, select your users and what you want to backup. You can be a bit selective here if you need, i.e you don't want to backup someones Drive.
![](/content/images/2021/02/11-user-selection.png)
And if your tenant has Shared drives you can select those on the other tab up the top
![](/content/images/2021/02/12-shared-drive-selection.png)
Now give the task a name and select that shared folder we created earlier, it will confirm to you the number of users and shared drives you have selected.

You will want to also enable the Active Backup for G Suite Portal so that you can perform backups or even create users for self service recovery.
![](/content/images/2021/02/10-backup-selection.png)
I mentioned auto discovery earlier, select the settings that best works for you. In my case i am leaving them all enabled so that anyone new that gets added to my tenant (or shared drives that are created) will be automatically protected.

Backup Policy is up next - select your options here that best work for your organisation, i.e you may want to schedule this for out of hours to reduce the load of the NAS / Internet Connection etc. I went for Continuous and preserve all versions.

You may want to tweak the versioning here if you have a busy tenant and are conscious of space utilisation on your NAS.
![](/content/images/2021/02/13-backup-policy.png)
Now complete the wizard and run the job...

You can see even here at home in my Lab i am able to get some pretty decent speeds from Google as data starts coming down.
![](/content/images/2021/02/15-internet-speed.png)
You can see what the job is doing via the task list
![](/content/images/2021/02/16-job-progress.png)
I let this run to completion and it took a couple of partial complete data before the dashboard started to run green. 

I really like the little backup summary calendar, visually very easy to see what days had a clean backup and if there are any issues. You can also see a task log and clicking the little arrow will bring up the complete list.

Here it goes almost a week on
![](/content/images/2021/02/17-job-complete-dashboard.png)
The dashboard has some other nice bits of information such as the service usage breakdown showing you how much of what data such as mail vs drive.
![](/content/images/2021/02/18-service-usage.png)
It also has a summary per day (or per hour) of data transfer so you can see the change delta visually.
![](/content/images/2021/02/19-daily-transfer-usage.png)
So there we go, now my G Suite is protected!

I will dive into how to recover data and what options you have with this in a follow up post.

I can highly recommend this product if you have a G Suite, especially since the licensing is **included **with your NAS. 

