---
title: 'Setup Immutable Microsoft 365 Backup Jobs with Veeam and S3 Immutable Object Storage' 
description: 'Want to take advantage immutable backup storage to protect against ransomware,
hackers or accidental deletion of your critical Microsoft 365 data? Goo'
heroImage: '/content/images/2023/04/microsoft-365-immutable-backups.jpg'
slug: 'setup-immutable-microsoft-365-backup-jobs-with-veeam-and-s3-immutable-object-storage'
pubDate: '2023-04-11T00:03:48.000Z'
tags: ["vbo", "microsoft365", "immutable", "ransomware"] 
categories: ['veeam']
author: ["ben"]
---

Want to take advantage immutable backup storage to protect against ransomware, hackers or accidental deletion of your critical Microsoft 365 data? Good news, with Veeam Backup for Microsoft 365 you can, if you are already setup and backing up your data with this product you can be up and running within 5 minutes it is that easy. 

### The setup 

First up you are going to need a bucket that has versioning and object lock ENABLED at the time of creation. I am creating one called 14thlane-immutable-copy that my copy jobs will target.

You could target a different region here to add some additional resiliency to your backup data

The below is via the Cloudian console but you can do the same via your own UI consoles or the s3 cli directly.
![](/content/images/2023/04/image.png)
Upon creation you can see it is enabled via the little padlock, again a Cloudian thing but your own interface or cli query can confirm this.
![](/content/images/2023/04/image-1.png)
With the newly created bucket we can add this as a object storage target in Veeam Backup for Microsoft 365 (VBM). Right click Object Storage > add object storage under the Backup Infrastructure pane within the VBM console.
![](/content/images/2023/04/image-2.png)
Give it a name, I am going to use the same as my bucket
![](/content/images/2023/04/image-3.png)
Then select your object storage "type", unless yours is one of the named vendors below then select S3 compatible like for our Cloudian target.
![](/content/images/2023/04/image-4.png)
On the next screen you will need to input your endpoint and region information as well as either adding or selecting your credentials if you have already added them (these are your s3 access keys)
![](/content/images/2023/04/image-5.png)
Now, select your bucket from the list you created earlier, for us its the 14thlane-immutable-copy bucket

Then under folder, you can add one using the interface, I called mine exchange-immutable
![](/content/images/2023/04/image-7.png)
Now, select the box stating "Make backup copies immutable for the entire duration of their...."
![](/content/images/2023/04/image-8.png)
We now have an object target but we still need a backup repository that attaches to this objet storage.

> If you have multiple proxies that the backup repository you create needs to be on the same proxy as the job you want to copy otherwise it will not become available for selection when you elect to copy the job

Right click Backup repositories this time and add one, giving it a name - again, I am sticking with the same as the bucket and object storage repository
![](/content/images/2023/04/image-9.png)
Because we can now, I am opting to go Direct to Object which is new functionality Veeam released in version 7 of this product. 

If you don't have this selection just go through the normal route of adding a local repository to the proxy and then selecting the offload to object - then selecting the object storage repository you added earlier. 
![](/content/images/2023/04/image-10.png)
You can now select the proxy (remember to select the same as the existing backup job), and give it a location for the local cache needed for operations.
![](/content/images/2023/04/image-11.png)
Now specify the object bucket and elect to use encryption if you wanted this as well (recommended!)
![](/content/images/2023/04/image-12.png)
Now we get to the important bit.
![](/content/images/2023/04/image-13.png)
Ok, a bit dramatic but this IS important. 

Because you have **enabled object lock**, your settings on this next screen matter. If you set a 3 year retention policy, just be aware - you will be responsible for picking up the storage costs on this data for 3 years.

By design (the s3 spec) this data can't be removed once an object is written into the s3 bucket that has versioning/lock enabled and the writing system (in this case Veeam) has set the lock date.

So it is important to set this to something that meets policy but you are going to understand the costs at the same time, or at least the person making the call around retention period understands the implications.

With that, I am going to set a relatively safe, 30-day retention.
![](/content/images/2023/04/image-14.png)
Point 1 there, I have selected item-level retention, this is because my other repostory types, where the primary jobs are going are also item-level. The source job repository types need to match the target copy job types - just so you are aware.

Done. Now we can create the copy job.

Back under Organisations, select the organisation you would like to enable copy jobs for and then right click the job, finally, "add to backup copy job"
![](/content/images/2023/04/image-15.png)
If you setup everything correctly (remember, same proxy!) then you should see your empty 14thlane-immutable-copy available in the list, select it.
![](/content/images/2023/04/image-16.png)
Depending on your infrastructure you can schedule the copy jobs to run, or just have it as soon as the primary has completed which is what I intend on doing.
![](/content/images/2023/04/image-17.png)
Complete the wizard wth your options selected and you will now notice in the list there is a new copy job, type of "copy" but it will also clone out the name of the primary job and append " - copy job" to the end
![](/content/images/2023/04/image-18.png)
You are now protected from ransomware or other bad actors or mistakes, nice one!

### What about restoring?

You will note, on the primary job you can restore data
![](/content/images/2023/04/image-20.png)
What if this was deleted accidentally or otherwise, infected by ransomware etc? Veeam would not be able to see anything in this repository and your restore would not work. Well that's why you created an immutable copy right?

Logically you will jump in and right click the copy job, expecting to see the Explore options right?
![](/content/images/2023/04/image-21.png)
Looks a bit different! That's because you do not access the copy job data here for this we need to dive into the Infrastructure pane and open up the backup repositories.
![](/content/images/2023/04/image-22.png)
You will see your immutable copy repository, right click and note, the explorer options are there. 

Select an option, then the org to open up the explorer. Exchange in our case.
![](/content/images/2023/04/image-23.png)
If you look at the data here, you an see its coming from the secondary backup immutable copy repository. Sorry mostly blurred out to protect the content. 
![](/content/images/2023/04/image-24.png)
All of the same options around Search and restoration you are used to with the explorer is available on the copy job. 

