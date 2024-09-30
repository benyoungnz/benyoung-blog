---
title: 'Backup Digital Ocean with Veeam Agent for Linux' 
description: 'Digital Ocean provide a fairly basic point in time snapshot backup function with
their service which works great, I have rolled back to a couple of dr'
heroImage: '/content/images/2021/04/Veeam-Digital-Ocean.png'
slug: 'backup-digital-ocean-with-veeam-agent-for-linux'
pubDate: '2021-04-14T00:04:59.000Z'
tags: ["veeamagent", "linux"] 
categories: ['veeam']
author: ["ben"]
---

Digital Ocean provide a fairly basic point in time snapshot backup function with their service which works great, I have rolled back to a couple of droplets before and it has worked very time.

But what about when you want something a little more configurable and also "offsite", not to mention we could look at some different recovery (to another IaaS platform) options in the future if required - Veeam Agent for Linux + Veeam Cloud Connect can help us with this.

> Note that I am opting for a Cloud Connect tenant but you could easily write the data locally and have a cron job move the data offsite sftp/s3 etc. There are [lots of destination options](https://helpcenter.veeam.com/docs/agentforlinux/userguide/backup_job_target.html?ver=50).

You will need;

1. Linux Machine 
*I am running a Ubuntu 18.04.2 LTS via a Digital Ocean Droplet*
2. Cloud Connect Tenant 
*I have provisioned this ahead of time at vBridge - the cloud provider I work for*
3. License for the Veeam Agent

> Note: You have a number of install options depending on your Linux flavour and / or if you have internet access or need to do a offline install. Check out the [official user guide](https://helpcenter.veeam.com/docs/agentforlinux/userguide/installation_process.html?ver=50) for version 5.0.

### Install Repository Install Package

First up we need to get the repository install package from the Veeam website, grab it from [veeam.com/linux-backup-download.html](https://www.veeam.com/linux-backup-download.html) and select your flavour and hit get link.
![](/content/images/2021/04/image.png)
This will open up a download section below, grab the file (veeam-release-deb{version}.deb in my case transfer this to your machine.
![](/content/images/2021/04/image-1.png)
I popped it somewhere public and just used wget but you 
![](/content/images/2021/04/image-2.png)
Now you have the veeam-release package on your machine, install it

```
    dpkg -i ./veeam-release* && apt-get update
```

You can then see a Veeam repository has been added to your list of sources
![](/content/images/2021/04/image-3.png)
### Veeam Agent Install

With the repositories now loaded we can run the install via the package manager.

```
apt-get install veeam
```

> Note... Ubuntu 20.04 and 20.10 on kernel version 5.8 or later require the nosnap version, so use apt-get install veeam-nosnap


You will be asked to install the package, select yes and let it do its thing.
![](/content/images/2021/04/image-4.png)
On my tiny little droplet this took a while to build due to the minimal processing power, got there in the end.... 
![](/content/images/2021/04/image-6.png)
You will end up with it starting the Veeam service.
![](/content/images/2021/04/image-7.png)
Now we are ready for the initial setup/configuration. Run "veeam" from your terminal.

```
veeam
```

This will load the UI to configure.

Agree to the terms, move next.
![](/content/images/2021/04/image-8.png)
At this point you can choose to create recovery media, [view the documentation](https://helpcenter.veeam.com/docs/agentforlinux/userguide/val_first_steps_iso.html?ver=50) on the Veeam site to work through your desired configuration. I went with the following.
![](/content/images/2021/04/image-9.png)
Let the install work through the ISO creation, took a few minutes on the droplet.

Select the file location of the license (there is a Trial you can register for on the Veeam site if you are only looking to kick the tires)

And then select the edition, this one is a server. Then complete the wizard by selecting Finish.
![](/content/images/2021/04/image-10.png)
This will bring us to the configure screen where we can now choose to backup certain volumes, directories or the entire machine. 
![](/content/images/2021/04/image-11.png)
Hit "C" to configure

Give you backup job a name
![](/content/images/2021/04/image-12.png)
Select what to backup (entire machine for me)
![](/content/images/2021/04/image-13.png)
The destination for me will be a Cloud Connect repository, since this is off network without any connectivity back to a B&R server and there is no file share either this is a nice simple option.
![](/content/images/2021/04/image-14.png)
Now I enter in my provider address details
![](/content/images/2021/04/image-15.png)
Followed by the credentials for my Cloud Connect tenant, this will be then validated and it will show you what resources you have available. You can also enter how many retention points you want to keep, i am bumping mine from the default of 7 up to 30.
![](/content/images/2021/04/image-16.png)
Select any advanced options if you require such as indexing oracle, mysql or any scripts you need to execute. I opted to enable backup file encryption, make sure you keep your passphrase secure. 
![](/content/images/2021/04/image-17.png)
Nearly there, complete your desired schedule, my requirements here are pretty simple so left it as the default and automatic, you can adjust as required.
![](/content/images/2021/04/image-18.png)
You will now get a summary, and you can opt to start the job now if desired. Select Finish.

My job is now running, I can see from the Digital Ocean dashboard blinky lights are flashing.
![](/content/images/2021/04/image-19.png)
And after a little while the job will be complete.
![](/content/images/2021/04/image-20.png)
And over on my Cloud Connect tenant I can see usage in my dashboard.
![](/content/images/2021/04/image-21.png)
That's all there is to it. You now have an offsite backup! In another post we will cover getting this running on another platform. 






