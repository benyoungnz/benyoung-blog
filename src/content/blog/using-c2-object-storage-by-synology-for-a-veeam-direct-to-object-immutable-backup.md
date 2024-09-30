---
title: 'Using C2 Object Storage by Synology for a Veeam Direct to Object Immutable Backup' 
description: 'Veeam have had Object and Direct to Object storage support for backups for a
while now. 

I was looking into C2 Object Storage which brings a bunch of'
heroImage: '/content/images/2023/12/Synology-C2-Object-With-Veeam-2.jpg'
slug: 'using-c2-object-storage-by-synology-for-a-veeam-direct-to-object-immutable-backup'
pubDate: '2023-12-11T22:41:52.000Z'
tags: ["synology", "veeam", "objectstorage"] 
categories: ['veeam']
author: ["ben"]
---

Veeam have had Object and Direct to Object storage support for backups for a while now. 

I was looking into C2 Object Storage which brings a bunch of perks to the table that make it a top choice. First off, let's talk about the price – it's simple and easy to understand, with no surprises with a fixed per terabyte cost each month. I love this.

Plus, here's the kicker: you can fetch all your stored data every month for free which is perfect for Veeam Backups as you often need to restore data right!? 

No hidden tricks or extra fees. They keep it straightforward - no charges for API requests or deleting data. It's hassle-free and budget-friendly.  Let's dive in and see how you can get up and running within 10 minutes. 

First, [head over and register/sign up](https://c2.synology.com/en-global) and enabled C2 Object storage. You are going to need it to follow along at home.. as well as a Veeam Backup environment V12 generation. 

## Adding a bucket and credentials

Let's start by adding a bucket trough the c2 cloud console. I am also electing to create access keys during bucket creation. We will need these when we add the C2 Object storage bucket into Veeam.
![](/content/images/2023/12/image.png)
It is great to see that Synology have decided to implement Object Lock - this is absolutely one of the most important things you should enable when writing backups to object storage. 

This allows for Veeam to write in data and make it immutable to prevent from accidental or malicious modification or deletion. These are you backups so take care of them!

Best of all, its a simple click to enable it in c2 cloud, and same on the Veeam end. Just leave it to not setting default retention - we will control this on the Veeam end. 
![](/content/images/2023/12/image-1.png)
You will now be presented with some access keys if you selected that option. Let's add them to Veeam. Via the menu top-left, select Credentials then Cloud
![](/content/images/2023/12/image-2.png)
Then select Add, and we want to select "AWS access key" since C2 is S3 compatible.
![](/content/images/2023/12/image-3.png)
Enter the details provided by the c2 portal.
![](/content/images/2023/12/image-4.png)
That is the basic setup done. We can now add the bucket into Veeam and configure a backup job.

## Adding a repository - Direct-to-object support

Under your backup infrastructure, select Add backup repository
![](/content/images/2023/12/image-5.png)
Then object storage, followed by s3 compatible
![](/content/images/2023/12/image-6.png)![](/content/images/2023/12/image-7.png)
Give it a name, mine is going to be c2-veeam-direct1
![](/content/images/2023/12/image-8.png)
On the next screen we need to add the account and service point. The account we have already added so select that from your existing credentials. 

For the service point you want to grab this from the c2 portal where you created the bucket. Out to the right on your bucket list hover until the copy endpoint shows up. Select that and paste it into your service point in Veeam. You can leave region as default us-east-1 or enter any other value.. it's not relevant with C2.
![](/content/images/2023/12/image-9.png)![](/content/images/2023/12/image-10.png)
All going to plan you can now select from available buckets and I can then choose the veeam-direct1 bucket we created earlier.
![](/content/images/2023/12/image-11.png)
I am then adding a lab1 folder inside the C2 object storage bucket to write our Veeam backups into.
![](/content/images/2023/12/image-12.png)
Ok now, remember we talked about Immutability and Object lock? Well here is where we configure it in Veeam. After ticking that option, enter your desired immutability period, mine is going to be 14 days but you do what works for your scenario, could be more, or less. 
![](/content/images/2023/12/image-13.png)
Work your way through the rest of the wizard, my Lab is just defaults, but you may have something different you want to adjust on the way through.

Now, Veeam will configure some things in the background and you will after a short while have a new object storage repository we can use for backups!
![](/content/images/2023/12/image-14.png)
## Configuring a backup job

Now we have added the storage, let's target a backup job and get our infrastructure backed up, and immutable!

Add a new backup from the Veeam console, give it an appropriate name and description.
![](/content/images/2023/12/image-15.png)
Add some items, or select tags, resource pools or folders. I am just selecting my K3s Kubernetes cluster plus a Development server running in my lab.
![](/content/images/2023/12/image-17.png)
Now here is the cool part. We can now target this job directly to our object storage - meaning we do not need (other than some cache space) to add any additional backup storage locally to store these backups. Synology C2 Object is going to be our primary target. 

You can also set your retention, this can be as much as you like, remember our repository was set to 14 days of immuability but you can write more data here, just know that anything >14 days in our case will not be immutable.
![](/content/images/2023/12/image-18.png)
Since this is an additional backup of these same machines I am actually going to adjust the schedule to 10am Weekdays.
![](/content/images/2023/12/image-19.png)
And there you have it, a backup job protecting your virtual machines using Veeam and targeting Synology C2 Object storage. Let's start the job and see how we go.
![](/content/images/2023/12/image-20.png)
This is running on my little lab backup server which is fairly under powered, i suspect we will max-out the CPU before we hit any bottlenecks out on C2 Object. 

And yes I was correct, peaking around 500Mbps on my side which is about maximum for my lab due to processor constraints.
![](/content/images/2023/12/image-22.png)
I will let this job play out and in a follow up post, we will look to restore some data from C2 Object.

