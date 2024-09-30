---
title: 'Changes to Microsoft Teams APIs are on the way and your backups will now cost you (chat only...for now)' 
description: 'Not really the news I wanted to wake up to late last week but we are here now so lets take a look at what this means, specifically what it means for '
heroImage: '/content/images/2022/06/teams-protected-api.jpg'
slug: 'changes-to-microsoft-api-for-m365-access-are-on-the-way-and-your-backups-will-now-cost-you'
pubDate: '2022-06-22T02:28:43.000Z'
tags: ["api", "teams", "office365"] 
categories: ['veeam']
author: ["ben"]
---

Not really the news I wanted to wake up to late last week but we are here now so let's take a look at what this means, specifically what it means for Veeam Backup for Microsoft 365 and every other M365 backup vendor in the market who have been using the Exchange Web Services API to access these messages.

What does it affect? This upcoming change will affect the way that Teams Messages can be accessed programatically. It does not affect the way the rest of the teams components are accessed (yet?...).  The access to these messages are being moved to the new **Microsoft Teams Protected API **and the bad news is this API is **metered,** and is actually backed by Microsofts own Cosmos DB as such have a transactional cost associated with each and every message (more on this further down). 

Now before we get into the downsides it is worth noting that this does come with a a couple of upsides, hint: more data, not throttled (faster)

- These new API's will open up access to **MORE data**, meaning vendors like Veeam will be able to leverage these to back more of your tenancy up
- These API's will be more reliable and are not (because they are metered) be throttled, so backups should be **FASTER**

Veeam are going to be releasing **Veeam Backup for Microsoft 365 v6a** - which includes support for this new Teams Protected API it is also at this point when you upgrade that the existing method will **cease to work** so chat will NOT be backed up from this point on. Also when you install v6a "chat backup" is off by default so you will need to get access sorted (more on this later) then enable chat backup if you choose to do so. 

You can see below the new option coming to organisation settings in Veeam Backup for Microsoft 365 around Teams backup around Chat backup opt-in and the warning messages associated with it (and the warning about additional charges), you still need to follow the steps further in this post for enabling it if you are clicking teams chats. 
![](/content/images/2022/06/image-1.png)
Processing options can also now been seen in the teams job below in 6a:
![](/content/images/2022/06/image-2.png)
### Getting Access to these new Protected API's

Ok, so your organisation has decided it wants to continue to back up Teams Messages you are going to need to tick a few boxes.

1. Ask Microsoft 
2. Adjust your App Registration with some additional permissions

**Ask Microsoft**
This is the bit that is to be honest pretty ridiculous for a technology company let alone one as big as Microsoft. The access is granted by asking for it via a... you guessed it an online form. 
![](/content/images/2022/06/image.png)
It is important to note that this is per organisation, so if you are a service provider you will need to get your clients to fill this form out as it is tied to and charged back to their tenancy.

> Request access here: [aka.ms/teamsgraph/requestaccess](https://aka.ms/teamsgraph/requestaccess)

If you need to put together a FAQ for your customers or organisation on now to fill out the form Veeam have a KB out on this at [veeam.com/kb4322](https://www.veeam.com/kb4322)

Now, as this is a manual form you submit this off into Microsoft land and they state this could take up to 2 weeks to process, more if there is high demand so I recommend getting in on this as soon as possible.

> Additionally, this is no way to track or monitor your progress in the queue.... nice one.

**Additional permissions to App Registration
**As part of setting up a organisation to backup with Veeam Backup for Microsoft 365 it will have created (or you created manually) an app registration in the tenant's Azure portal which controls what the product can access in the tenancy. It configures all of the required permissions - so if you are opting in you will need to 

- **Chat.Read.All**: enables access to all 1:1, group chat, and meeting chat messages 
- **ChannelMessage.Read.All**: enables access to all channel messages 
- **User.Read.All**: enables access to the list of users for a tenant

To access this app registration login to your Azure portal, these application permissions can only be consented by an administrator. 

### How is this API metered, what will it cost?

Good question. It is a bit hard to accurately work this out but it is important to know how messages are stored depending where in teams they are sent.

> Microsoft have **no de-duplication**, in essence every time a message is sent, every member of the group/team/chat stores a copy and you are charged for each message to be backed up.

**Person to person (1:1) chat**
These are messages sent from one user directly to another in a one on one chat. You can use the following equation;

> ((# of messages) * 2) * 0.00075$

**Group Chat (1:many) or Teams meeting chat **
This is where things can get a little wild so buckle up - lets use the scenario below where we are in a teams meeting with **100 people.**

For **every** message sent here, including silly memes, emojis, short comments like "lol" this means **100 copies** of the message are stored and backed up. You can see how this could very quickly add up. you would use the below equation for group messages

> ((# of messages) * (# of  chat/call members) * 0.00075$

**Teams Channel Chat**
This differs from the above model,  where a message is sent within a Teams Channel it is stored differently and every message is only backed up once. So the equation is still a bit more palatable, but still not insignificant across a large organisation. 

> (# of messages) * 0.00075$

Simple right?

### Service Providers

What changes for you? Basically a bunch more admin overhead for existing tenancies + new tenancies that wish to backup Chat from Teams.

In saying that, the timing of a 6a upgrade in production needs to be timed in carefully.

- Prepare/automate comms out to each of your customers informing them of this change to metered chat backup + deprecation of old 
- Prepare a document walking them through the opt-in process via the online form and additional permissions they require
- Follow up with customers who have elected to backup chat and ensure they have the response back from Microsoft to say their access has been approved
- Enable organisation for chat backup

### Timeline (approx)

Information around this is changing daily based on what i read but as I write this, my take is;

- Veeam Backup for Microsoft 365 6a will be released sometime in July-August, remember once cutover the old chat backup will no longer function despite the Oct 1 date below
- Microsoft will deprecate the old access method on October 1, 2022, so if you want chat backup after this upgrade to 6a is an absolute requirement
- Metered access to the Teams Protected API will being around July 5th, 2022, pay Microsoft more money from here...

### What I think needs to change 

- Microsoft need to do away with the manual request form and allow this via admin center/Azure portal so access is immediate or at the very least progress can be tracked
- Microsoft need to provide some better tooling to help with calculations, this is currently very difficult and is an estimate
- Microsoft need to sort out the de-duplication thing so every message sent is a single item and not one per recipient, this will be a massive cost saving for organisations wanting to backup teams chat

### Closing thoughts

Nice that vendors and organisations have a different way of accessing their data but what worries me is that accessing your data now comes at a cost. Remember the above is only for teams chat access which already the numbers could be pretty significant for a large organisation.

What happens when more of the Microsoft API's go this way for things like Exchange, Sharepoint, OneDrive? Are they going to follow a similar model? 

On one hand I get it, but on the other accessing your data to perform a backup when there is no similar solution for this built into M365 - sure there is a bunch of config items here like legal hold etc but its not a backup and this misses a lot of data.

It will be interesting to see how this all plays out over the next couple of months.

