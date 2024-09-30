---
title: 'Notify Teams of Veeam Backup Repository Utilisation or Configuration Drift' 
description: 'With the introducto

Configure Teams
First we need to configure an incoming webhook for our alerts. Within a Team,
enter the channel you need these pu'
heroImage: ''
slug: 'notify-teams-of-veeam-backup-repository-utilisation-or-configuration-drift'
pubDate: '1970-01-01T00:00:00.000Z'
draft: true
categories: ['veeam']
author: ["ben"]
---

With the introducto

### Configure Teams

First we need to configure an incoming webhook for our alerts. Within a Team, enter the channel you need these pushed into - then select the ellipsis menu, followed by Connectors 
![](/content/images/2022/11/image-4.png)
We want to select Incoming Webhook from the list
![](/content/images/2022/11/image-5.png)
You can enter a name for your webhook and select an icon - I just went with BenBot and utilised the icon from my blog (you can leave this as default if you like). finally, hit create. 
![](/content/images/2022/11/image-6.png)
In a few seconds it will generate you a url that starts with https://XXXXX.**webhook.office.com/webhookb2/{big long identifiers here}**

You need this url, so copy it out and save it for later on in our configuration file.
![](/content/images/2022/11/image-7.png)
Hit done, that's all we need for now. You will notice that Teams has notified the channel of the new BenBot webhook and it has our icon as configured.
![](/content/images/2022/11/image-8.png)

