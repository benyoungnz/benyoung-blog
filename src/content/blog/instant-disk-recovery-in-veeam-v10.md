---
title: 'Instant Disk Recovery in Veeam v10'
description: 'Instant Disk Recovery in Veeam B&R allows you to instantly recovery a disk (or disks) to running virtual machines from the backup environment. Check out how easy it is.'
heroImage: '/content/images/2020/02/header-instant-disk-recovery.png'
slug: 'instant-disk-recovery-in-veeam-v10'
pubDate: '2020-02-06T09:13:03.000Z'
tags: ["veeam", "v10", "instant recovery"] 
categories: ['veeam']
author: ["ben"]
---

Working for a service provider we deal with a lot of restoration requests from our clients. Up until now, we have been using a combination of methods to get our clients data securely back to them in the fastest way possible.

The most common method we use is the Instant Recovery feature which allows the Veeam Backup server to present the backed up virtual machine to the ESXi hosts.

We then give them two options;

1. The client can use our portal to access the virtual machine console, add a new disk to the instant recovery machine and copy data they want to recover. Once complete, we move the temporary disk to a running production machine for them to copy the data off before destroying this disk and the instant recovery
2. We simply detach the desired drive from the instant recovery to a running production machine. They copy the data and when complete we tear everything down cleanly

This works great although I would LOVE an API we could him via Enterprise manager to automate the instant recovery side of things.

### Introducing Instant Disk Recovery

With this new feature, we can now simply instantly recover disk(s) from a backup directly to a running machine - the original or another machine.

Here is a quick demo of a single disk being presented to another virtual machine here in my lab.

### Walkthrough

Find the backup, right click hit **Instant Disk Recovery**

![1.context-instant-disk-recovery](/content/images/2020/02/1.context-instant-disk-recovery.png)

Select the desired restore point

![2.select-restore-point](/content/images/2020/02/2.select-restore-point.png)

Choose the destination machine (it can be the original or a different one)

![3.select-destination-machine](/content/images/2020/02/3.select-destination-machine.png)

Now, take note of the **Virtual Device Node** - you are going to want to ensure that you do not replace an existing disk on the destination machine that has the same node ID.

Thankfully, Veeam has all the info at hand. Select each disk, and click change. Notice below the warning around existing disk will be replaced.

![4.disk-mapping-warning](/content/images/2020/02/4.disk-mapping-warning.png)

Simply change the node ID to another that is not already in use at the destination and it will all check out

![5.disk-mapping-ok](/content/images/2020/02/5.disk-mapping-ok.png)

Confirm your disk mapping

![6.confirm-virtual-disk-mapping](/content/images/2020/02/6.confirm-virtual-disk-mapping.png)

The next screen has a neat little guest feature around what should happen when this disk is attached and if it should be scanned for malware etc, confirm what you want to do.

![7.secure-restore-options](/content/images/2020/02/7.secure-restore-options.png)

Now confirm your recovery options

![8.confirm-instant-disk-restore-options](/content/images/2020/02/8.confirm-instant-disk-restore-options.png)

Let it play out, and once it has contacted the virtual environment and attached the disks you should see a summary like the below. Also, you will see an instant recovery node on the Veeam menu.

![10.restore-history](/content/images/2020/02/10.restore-history.png)

On the virtual environment, you can see an NFS datastore has been added

![11.nfs-datastore-added](/content/images/2020/02/11.nfs-datastore-added.png)

And on the virtual machine, you can see that the virtual disk has now been attached (Hard Disk 2 for me below)

![12.disk-added-to-vmware](/content/images/2020/02/12.disk-added-to-vmware.png)

In Veeam you will see the Instant recovery node now it is all there. You can then right-click this and have the options you are used to with the full virtual machine instant recovery such as stop publishing or migration to production (keep it).

![13.veeam-instant-recovery-running](/content/images/2020/02/13.veeam-instant-recovery-running.png)

Pretty neat, we will be using this every week.

I will be waiting for some of the PowerShell documents to come out around v10 and I may even try to wrap my API around some PowerShell remoting to automate this end to end for our customers.

