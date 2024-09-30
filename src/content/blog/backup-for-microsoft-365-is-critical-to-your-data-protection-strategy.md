---
title: 'Backup for Microsoft 365 is critical to your data protection strategy' 
description: 'I think it is time we had a discussion about Microsoft 365 and data protection.
Before we do that let us cast our minds back to the way things used to'
heroImage: '/content/images/2022/11/backup-microsoft-365.jpg'
slug: 'backup-for-microsoft-365-is-critical-to-your-data-protection-strategy'
pubDate: '2022-11-07T00:54:42.000Z'
tags: ["office365", "microsoft365"] 
categories: ['veeam']
author: ["ben"]
---

I think it is time we had a discussion about Microsoft 365 and data protection. Before we do that let us cast our minds back to the way things used to be to understand where we have come from, to where we are now. 

More importantly **what we have forgotten **or have perhaps misunderstood along the way.

## Before migration to Microsoft 365

Not that long ago - "the cloud" was reserved for the latest hot startup out of silicon valley. 

The reality is we have now seen a huge shift for traditional IT applications like email and communication tools move, and for good reason, to the cloud - this is where M365 comes in. For a simply monthly price you no longer need to worry about feeding and watering large amounts of infrastructure in your environment. 

Let's pick on a single product as an example but the reality is, this applies to everything in M365 - or pretty much every SaaS "cloud" based product out there.

Remember when e-mail was a thing? Oh wait... it still is... Well, these mail servers, known as Microsoft Exchange servers used to run on-premises.

Any IT department worth their salt would have built in two things to ensure they were doing right by their organisation.

1. Service availability
2. Data protection strategy

**Service availability **
Firstly, most commonly these were built upon virtual machines deployed onto highly available **storage** such as big arrays of hard drives designed to tolerate failure and **compute** consisting of lots of servers combined together to form a resilient cluster. 

Secondly, the Exchange environment would have been built in such a way that it could tolerate a node failure, meaning an Exchange server could go offline either planed (i.e patching) or un-planned (hardware outage, server crash). They did this by configuring a DAG - essentially a cluster made up of 2 or more exchange servers. 

**Data protection strategy **
The servers/storage we talked about above would be backed up using a backup tool typically managed by the IT department following the tried as tested 3-2-1 methodology.
![](/content/images/2022/11/image-2.png)(source: Veeam)
- 3 = Maintain at least 3 copies of your data
- 2 = Keep copies on two different media (such as disk, tape)
- 1 = One offsite copy, perhaps even in another cloud provider (BaaS)

This gives you the best chance of recovering in the event of a disaster - whatever that may be such as Fire, Flood, Earthquake - but, and this is the important piece which we will cover later, also "**user error**" which is actually more common than the Fire/Flood/Earthquake scenario would you believe.

The last part of this recovery strategy is ensuring that should we need to go back and restore this data we can, ideally at a **granular level **- think email items or entire mailboxes in our Exchange example. It's a bad day if we need to recovery the entire Exchange environment but pretty much all backup products worth their money should be able to handle this by keeping an image-level backup of each server so this is an option too.

## After migration to Microsoft 365

Your organisation is happy, the IT department has migrated everyone's data up to the M365 cloud. The project was a success. What does this mean for each persona?

**Users**
Can now collaborate even easier than before and are starting to put **more data in the cloud** since they now have tools like OneDrive at their fingertips, Teams chat has taken off as the primary communication tool and the world is good.

A side note here is that Microsoft saw a **HUGE** uptake in this product during the pandemic when almost overnight stay at home orders came into place, below is a direct quote from the Azure blog.

> Since its launch, Teams has experienced strong growth: from launch in 2017 to 13 million daily users in July 2019, to 20 million in November 2019. In April *(2020)*, we shared that Teams has more than **75 million daily active users**, 200 million daily meeting participants, and 4.1 billion daily meeting minutes.

**IT Department**
Large amounts of on-premise infrastructure has been turned off, the organisations storage requirements have shrunk, they have less servers to patch. Generally, their world just got a lot more simple.

They can do this because Microsoft now take care of the servers, storage and high availability design of the solution to ensure maximum resiliency.

But... (you knew this was coming) do you know what Microsoft **do NOT** take care of that the IT department used to maintain?

The **data protection strategy. **This is what is often forgotten, or at least misunderstood along the way. 

### Common misconceptions about Microsoft 365 data protection

Time to take a look at a couple key misconceptions about your data when it is in their cloud services.

**Microsoft have a backup of my data**
Incorrect. In fact their own services agreement states the below:

> "We recommend **that you regularly backup** Your Content and Data that you store on the Services or store **using Third-Party Apps and Services**."
> - Microsoft Services Agreement, [**link**](https://www.microsoft.com/en-nz/servicesagreement/default.aspx#:~:text=We%20recommend%20that%20you%20regularly%20backup%20Your%20Content%20and%20Data%20that%20you%20store%20on%20the%20Services%20or%20store%20using%20Third%2DParty%20Apps%20and%20Services.)

The key point there "that **YOU** regularly backup **YOUR** content and data" - it's your data, so protect it!

This is not an uncommon assumption either. Amazingly, [ESG Master Survey](https://www.esg-global.com/research/esg-master-survey-results-2021-data-protection-cloud-strategies) results indicate that **35% of people surveyed** believed that their SaaS vendor, i.e Microsoft is responsible for data protection.

This is where the **shared responsibility** model is good to understand - taking a look at the infographic below we can visualise responsibilities when it comes to Microsoft 365. 
![](/content/images/2022/11/image-1.png)(source: Veeam Blog)
You will notice some other items in there such as security and regulatory and you can draw a good comparison to data protection here. 

For example, we know Microsoft will take care of the physical security, access to the datacentre and the physical servers and storage it is running on, as well as access to the exchange servers themselves. But, we know it is our responsibility to look after user security like good password policy, multi factor authentication, log auditing etc

> More detailed information around the Microsoft Shared Responsibility model over on the [Veeam blog](https://www.veeam.com/blog/office365-shared-responsibility-model.html)

**Retention policies are backups**
Even by definition these are two different things:

- Backup is a copy of your data that you can utilise to recovery from should you need
- Retention is a short way of saying how long something needs to be kept for, before we can delete it. Even backups use this terminology, i.e how many days a restore point should be kept before the backup product removes the restore point

This doesn't mean you should not use retention policies to retain your data online in the cloud for legal or compliance purposes - just don't be fooled that this is good enough for a backup.

Sure you could set the retention policies to large numbers but this has other implications such as data storage cost and soon you will be on you way to paying more to retain your data than a normal retention period + third party backup. 

If you recall our 3-2-1 rule, utilising only retention policies also means we never get the 1 offsite, or "off cloud" copy either.

## So why would we need a backup, what are we protecting against?

Traditionally when we think about backups and what they are for we think the traditional items like fires or natural disasters, that is unlikely to occur in these massive "clouds" that are built across multiple facilities right?

This is true to a certain extent, M365 is a high resilient platform built across facilities all around the world but that is not to say that could not suffer data loss as well. Referring back to their own [Services Agreement](https://www.microsoft.com/en-nz/servicesagreement/default.aspx#:~:text=WE%20DO%20NOT%20GUARANTEE%20THE%20SERVICES%20WILL%20BE%20UNINTERRUPTED%2C%20TIMELY%2C%20SECURE%20OR%20ERROR%2DFREE%20OR%20THAT%20CONTENT%20LOSS%20WON%27T%20OCCUR%2C%20NOR%20DO%20WE%20GUARANTEE%20ANY%20CONNECTION%20TO%20OR%20TRANSMISSION%20FROM%20COMPUTER%20NETWORKS) under the warranties section:

> WE DO NOT GUARANTEE THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE **OR THAT CONTENT LOSS WON'T OCCUR**, NOR DO WE GUARANTEE ANY CONNECTION TO OR TRANSMISSION FROM COMPUTER NETWORKS.

Then there are other security threats and complexities that you, as an organisation are responsible for, remember, the shared responsibility model?

There any many edge cases and other reasons, however these are the most common reasons you need to have a third-party backup solution in place for your data.

**Retention / Policy Gaps**
These are complex to configure, you will likely also need more than one policy to achieve your requirements. This leads to a high risk of creating gaps between policies that you are unaware of, thus, creating a gap in your data retention.

**User Error / Accidental Deletion**
How many times have you accidentally deleted a file by clicking the wrong button - or heard of the "coding guy" down the hall running a script that went bad. There are many different iterations of this and it happens all the time, in fact it is the most common data loss scenario of them all.

**Security Threats**
These are becoming prolific. Almost daily we are seeing organisations being compromised due to ransomware or phishing attacks. Attackers with credentials could take over and remove compliance and retention policies in some cases before removing data from your M365 tenancy. 

> Additional reading on this, 7 Reasons why Microsoft 365 Backup is Critical over on the [Veeam blog](https://www.veeam.com/blog/momentum-office-365-backup.html)

## What are my options, how easy is it to backup to a third party?

The good news is this is actually very simple to enable. Microsoft have provided external API's allowing third-parties to reach over and grab it, securely, with consent of course.

There are many software applications and even other SaaS / Cloud Providers that have services for this already it all depends on what your strategy is around running your own infrastructure or if you want to outsource that.

In either scenario above I personally like the Veeam Backup for Microsoft 365 product. It provides support for 

- Exchange 
- OneDrive
- Teams
- Sharepoint

The product is flexible that you can configure the **data protection** to have a mix of what is included or excluded and how long to retain the data for and how often the jobs run. In short, lots of levers for you to pull if you need this level of control. 

When it comes to **restoring data** they provide market leading tools to allow for searching data held in your backups or for eDiscovery. My favourite feature though is the ability to compare your backup data with what is in M365 so you can easily see what is missing, this is useful for when a user can't quite recall what they deleted but know they removed a bunch of files, or, where an employee as "exited" the organisation and had a wee clean up along the way.

When it comes to licensing this is where I also like the Veeam product. Some products will make you pay for all users that are in the backup set - meaning any users who have left the company you still need to license in order to retain their data. With Veeam however you only pay for active users so all historic data in the tenancy can be retained at no cost (other than storage of course).

> For a detailed rundown of this product head on over to the [Veeam Backup for Microsoft 365](https://www.veeam.com/backup-microsoft-office-365.html) product page.

You now need to make the decision, do you want to feed and water the backup environment, or outsource that. Each has their own merits it all comes down to what resources you have internally. 

### Running your own

All you need here in most cases is a single server, for large organisations you may need to deploy some additional worker nodes to help you handle the large volume of data you are producing and split the jobs out across these.

The server can be anything from a physical or virtual server on-premises, but if you got rid of all that a while ago then you can spin up a virtual machine in any cloud provider that supports a Microsoft Windows and run the Veeam product from here.

On where to store the backup data. My recommendation would be object storage, any s3 compatible provider is supported such as AWS, Azure, Wasabi or a provider local to you to keep up with regulatory requirements. Object storage is highly resilient but also highly scalable so you should never need to worry about expanding your bucket. 

However, the product supports saving the data to normal block (local hard drive) as well just be aware you will want to monitor the local drive and expand this as your backup grows.

### Outsourcing

This is the easiest option - Veeam have a growing number of Service Provider Partners that work with Veeam every day and are experts in configuring and maintaining these environments so you don't have too.

All good providers should have automation built in so for the most part you can onboard yourself with your M365 credentials, then the providers automation will kick in and set everything up with best practices. 

Once you are configured your service provider will provide you a dashboard to view backup history and the levers for you to be able to control what is backed up and how long it is retained for. They will also provide you will the tools or a portal for you to restore data when you require.

Often the billing models for this are simple, similar to how you consume M365 which is a (#of users * license) + total data storage but confirm this with your provider.

> As a disclaimer,  I happen to work for one, Softsource vBridge, you can request some [more information](https://vbridge.co.nz/business-solutions/secure-backup-for-office-365-made-easy/) here around what we do. We have built in all of the automation above to make it easy for you to consume on a monthly basis, no term commitments

If New Zealand is not for you then check out the [Find a Partner](https://www.veeam.com/find-partner.html?ad=menu-partners) page on the Veeam website, just be sure to select the "find a provider" button, you can use the menu on the right to change parameters are required 
![](/content/images/2022/11/image-3.png)
I hope this at the very least informed or confirmed a few things around Microsoft 365 when it comes to backups and data protection. 

