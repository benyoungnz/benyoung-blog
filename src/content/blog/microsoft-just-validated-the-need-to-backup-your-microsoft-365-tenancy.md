---
title: 'Microsoft just validated the need to backup your Microsoft 365 tenancy' 
description: 'Guess what? Microsoft are launching their own native backup and archive tools
from late 2023. I have written in the past about why you should protect '
heroImage: '/content/images/2023/08/m365backup.jpg'
slug: 'microsoft-just-validated-the-need-to-backup-your-microsoft-365-tenancy'
pubDate: '2023-08-09T04:34:09.000Z'
tags: ["vbo", "veeam", "microsoft365"] 
categories: ['veeam']
author: ["ben"]
---

Guess what? Microsoft are launching their own native backup and archive tools from late 2023. I have written in the past about why you [should protect your critical Microsoft 365](https://benyoung.blog/backup-for-microsoft-365-is-critical-to-your-data-protection-strategy/) . Microsoft have just re-validated this again with this launch announcement. 

In the previous post I covered off the why - this should be obvious by now, with cyber-related incidents on the rise and a growing number of compliance or regulatory requirements being put on industries, more workloads being moved to this platform - Not having a backup of your Microsoft 365 tenancy is really longer an option.

I think this is the final nail in the coffin for those who believe they do not need to backup their Microsoft 365 tenancy and will hopefully accelerate adoption of third party products such as Veeam Backup for Microsoft 365.

As a side note, this is not a new statement by Microsoft that you should be backing up your data on their platform. Referring back to their own Services Agreement we all agree to upon registration. 

Under the[ warranties section](https://www.microsoft.com/en-nz/servicesagreement/default.aspx#:~:text=WE%20DO%20NOT%20GUARANTEE%20THE%20SERVICES%20WILL%20BE%20UNINTERRUPTED%2C%20TIMELY%2C%20SECURE%20OR%20ERROR%2DFREE%20OR%20THAT%20CONTENT%20LOSS%20WON%27T%20OCCUR%2C%20NOR%20DO%20WE%20GUARANTEE%20ANY%20CONNECTION%20TO%20OR%20TRANSMISSION%20FROM%20COMPUTER%20NETWORKS):

> WE DO NOT GUARANTEE THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE ****OR THAT CONTENT LOSS WON'T OCCUR****, NOR DO WE GUARANTEE ANY CONNECTION TO OR TRANSMISSION FROM COMPUTER NETWORKS.

And, under the [service availability](https://www.microsoft.com/en-nz/servicesagreement/default.aspx#:~:text=In%20the%20event%20of%20an%20outage%2C%20you%20may%20not%20be%20able%20to%20retrieve%20Your%20Content%20or%20Data%20that%20you%E2%80%99ve%20stored.%20We%20recommend%20that%20you%20regularly%20backup%20Your%20Content%20and%20Data%20that%20you%20store%20on%20the%20Services%20or%20store%20using%20Third%2DParty%20Apps%20and%20Services.) section,

> In the event of an outage, you may not be able to retrieve Your Content or Data that you’ve stored. **We recommend that you regularly backup** Your Content and Data that you store on the Services or store **using Third-Party Apps and Services**. 

### What is this new Microsoft native backup and archive products?

Details are a little scarce at the moment but I am sure we will see more come out prior to general availability, including the pricing. What we do know however is.

**Backup Product**

They are targeting your daily operations with this, anything currently active in your tenancy will be covered.

- Backup of SharePoint sites, OneDrive accounts, and Exchange mailboxes.
- Granular restoration of content at scale and specific restore point date ranges.
- **Backup APIs** for partners to create comprehensive data protection solutions.

The **Backup APIs part is the most exciting part of this**, more thoughts on this below.

**Archive Product**

As you start reaching capacity limits within your tenancy, this product is designed to take the pressure off by storing it in an archive which can then be rehydrated.

- Archiving or reactivating full sites within Microsoft 365
- Retaining your full admin-level search, eDiscovery, access policy, and other security functionalities.
- File-level archiving is to be available next year

### What does this mean for third-parties such as Veeam Backup for Microsoft 365?

I think its a good thing! As we have established, Microsoft just re-validated the requirement publicly and as such have raised awareness across the globe. 

Market leading vendors like Veeam - who by the way have the biggest market share protecting ~15 million users can now build upon the** HUGE head start** they have on Microsoft's own offerings.

Think about it, they have been building and maturing their product for a number of years now, currently in a version 7 product cycle. With native object storage support allowing you to control the cost and location of your backup storage more easily and get it off-site out of the native Microsoft world if you wanted too, market leading search and restore capabilities and experience, self recovery portals to name a few.

The launch of these new Backup APIs as part of the Microsoft launch is a smart move. Microsoft know that vendors like Veeam are better positioned to deal with backups which is not part of their core business. As such, Veeam have been named as a launch partner who will get access to these APIs at first launch.

### What could we see Veeam enhance with these new API's?

All products are in the same boat here by the way, not just Veeam. The functionality Veeam can provide is directly linked to what Microsoft provides in their official API's.

Here are the top things I hope Veeam may be able to enhance, all a guess a this point nothing has been announced. 

**Performance boost**
Microsoft have mentioned SLA'd performance and restore times in their product which must mean a new set of API endpoints or a change to the way certain actions are throttled.  

It is well known that Microsoft throttle pretty heavily their endpoints, not unusual, but when you are trying to backup or more importantly restore a lot of data this can delay recoveries.

This would be a major win, especially when it comes to Sharepoint data. If the new backup product utilised snapshot-like functionality in Microsoft 365 - Veeam may be able to leverage these snapshots to take the backups from which may not be subject to the same level of throttling for the backup side especially. 

They have said this can be driven by partners, but "within the trust boundary" so time will tell if that also allows for data to be pulled out/in at speed.

**Alternative Archive**
Veeam already are leaders in archiving solutions which can be seen in their flagship product Backup & Replication but also for their cloud backup tools like AWS and Azure backup with proven track record on cost efficiency over the native tools for these clouds. 

Here's hoping Veeam can leverage the archiving API's and provide a better, more cost effective and feature rich archive experience than what Microsoft can offer.

**Additional restore functionality**
I suspect as part of Microsoft own offering they will be creating a bunch of new endpoints to manage restores to support their own User Interface. 

Veeam can hopefully leverage these to further enhance their already very comprehensive restore capability in their own native explorers and self recovery portal. 

**Compliance dashboard integration**
A big part of compliance is being able to report on and have visibility of it. Microsoft have already invested heavily in creating compliance dashboards for aspects of their M365 offering, one can only assume part of this compliance dashboard will be showing backup state. It would be fantastic is something like Veeam Backup for M365 could send and control backed up state back into M365 allowing the organisation to centrally see backup compliance along side other KPIs.

### So is Microsoft launching their own native M365 backup a good thing?

You bet! 

As we have covered they have really turned the spotlight up to full power and highlighted the need to backup your Microsoft 365 tenancy - closing the book hopefully for the those not already doing this thinking that the platform already has your back in this space.

Because of this I believe we will see Veeam Backup for Microsoft 365 get a bunch of new functionality and performance enhancements because of it. Making an already market leading product even better. 

Importantly I think we will see that using Veeam we will be able to deliver a much more cost effective and flexible product - such as being able to BYO your own storage be it alternative cloud or on premise object, or local block options allowing you to be in complete control of storage costs. 

