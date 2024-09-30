---
title: 'Multi-tenant (VCSP) Self-service restore using Veeam Backup for Microsoft 365 v6' 
description: 'With the launch of Veeam Backup for Microsoft 365 came the release of a
self-service restore portal.

As a service provider it has been on our roadmap'
heroImage: '/content/images/2022/05/m365-self-service-recovery.jpg'
slug: 'multi-tenant-vcsp-self-service-restore-using-veeam-backup-for-microsoft-365-v6'
pubDate: '2022-05-25T03:56:42.000Z'
tags: ["vbo"] 
categories: ['veeam']
author: ["ben"]
---

With the launch of Veeam Backup for Microsoft 365 came the release of a self-service restore portal.

As a service provider it has been on our roadmap for a while to build out web based data recovery explorers in our own portal. So this was of interest when it was announced. Let's take a look at what is is, how you enable it and could it be of use from a service provider perspective (no brainer for an enterprises single tenant install!)

### Enabling the self-service portal 

Under the general options you will see a new tab named Restore Portal. 
![](/content/images/2022/05/image.png)
Select the box and then we need to create a new application in Azure, this will be in the service provider tenancy.

Configure up the app registration with your setting, you will need appropriate access to do this in Azure AD. I have added custom port here but this could be just normal 443 for https for ease of use to customers.
![](/content/images/2022/05/image-3.png)
> Note if you customise the port, you need to adjust the Restful API port to match, the default is 4443, i want to use 4444. So enter the URL as above but on the REST  API tab in settings, change the value here too

When you save this and apply the settings to enable the portal, it will throw an error and tell you Authentication for restore operator needs enabling, it then opens the tab where you can install some certs or generate some as i have done below.
![](/content/images/2022/05/image-2.png)
With all of that enabled, ill open up some access on the firewall and then load it up. 

### First impressions

Upon hitting the page you will be asked to login, enter your account details, in my case I will use a test account that is just a regular use of our tenancy (that is also the service provider tenancy) 

Upon validation it will send you to the Microsoft screen for authentication
![](/content/images/2022/05/image-4.png)
Then when complete will return you back where the VBO server performs additional validation and callback from the auth process.
![](/content/images/2022/05/image-5.png)
After a few seconds my data showed up. Some email and OneDrive data.
![](/content/images/2022/05/image-6.png)
Let's try a OneDrive install to kick the tires a bit. Select some items then hit restore.
![](/content/images/2022/05/image-8.png)
It takes me to a restore wizard, i can then confirm these are the files i want to restore. Then select a restore more, let's Keep the original and see what turns up.
![](/content/images/2022/05/image-9.png)
Complete the wizard and you are then presented with a restore session when you can monitor progress.
![](/content/images/2022/05/image-10.png)
Ok. that worked well.

What do I see now if i login with my elevated Global Admin account, this doesn't have a valid license so I suspect i will not see anything here... which, is the case.
![](/content/images/2022/05/image-11.png)
### Restore operators

Ok so we can see a user can login and view their own data - but what about when an organisation wants to delegate restore access to all or part of the organisation to allow for restoration via this portal on behalf of another user or perhaps even the entire organisation (i.e a trusted service desk operator)

In the menu select restore operators

Then give your Role a name, in my case "Super powers" with the org after it so i know what is what when we have roles for different organisations in the multi tenant environment.
![](/content/images/2022/05/image-12.png)
Now select the organisation
![](/content/images/2022/05/image-13.png)
On the next screen select who from that organisation has access to this role. In my case an unlicensed user with no data.
![](/content/images/2022/05/image-14.png)
And then select what this Role has access too, entire org or just certain items/groups

I will run with the entire organisation here as selected below
![](/content/images/2022/05/image-15.png)
But it is worth noting you can be as granular as you need here by selecting groups, users or individual sites - this might get a bit messy a time goes on and organisations change but if you need an "HR Restore" role you could delegate to just objects in say an "HR" group within your tenancy.

The neat thing here is you can also exclude items on the next step so you could for example grant access to the entire organisation for the help desk users but exclude CEO / Board / HR type groups which may contain sensitive information.
![](/content/images/2022/05/image-16.png)
I won't be adding any in this example. Once created the new role will be listed like the below.
![](/content/images/2022/05/image-18.png)
### Testing out the restore operator

Ok with my user now having been granted restore operator access, let's login and see if i can now see data in the tenancy, remember we selected everything with no exclusions.

Ok so at first you login, you'll be asked to consent on behalf of your organisation, this creates and azure app registration. Then you are returned to the login but.. no go, no permissions?
![](/content/images/2022/05/image-20.png)
"Unable to connect to the resource. Azure AD application doesn't have the required permissions."

So as it turns out you need to do a couple of things AFTER you created restore roles etc. This is only for service providers OR where there is more than one organisation under management in the VBO instance.

The script is a one off per customer but Chris Arceneaux has you covered over on the VeeamHub specifically the Connect-VB365RestorePortal.ps1

[https://github.com/VeeamHub/powershell/tree/master/VB365-RestorePortalSetup](https://github.com/VeeamHub/powershell/tree/master/VB365-RestorePortalSetup)

And the official docs are here for VCSP with multiple tenants [https://helpcenter.veeam.com/docs/vbo365/guide/ssp_configuration.html?ver=60#configuring-restore-portal-for-multiple-tenants](https://helpcenter.veeam.com/docs/vbo365/guide/ssp_configuration.html?ver=60#configuring-restore-portal-for-multiple-tenants)

Clone the repository or grab that C**onnect-VB365RestorePortal.ps1** script, then get the Application ID from your Restore Portal Tab
![](/content/images/2022/05/image-21.png)
Finally, change line that says <changeme> with your application ID like the below
![](/content/images/2022/05/image-22.png)
Ok, run the script with ./C**onnect-VB365RestorePortal.ps1 **it will install any modules required as below;
![](/content/images/2022/05/image-26.png)
Then once complete it will prompt you to login with an account from that organisation to assign the required permissions.
![](/content/images/2022/05/image-27.png)
Once complete, you will see permissions are assigned / granted to this enterprise application.
![](/content/images/2022/05/image-28.png)
Now let's try login. SUCCESS!

As expected, we see no data as this account is unlicensed
![](/content/images/2022/05/image-29.png)
You will notice though clicking your name top right in the menu bar now shows "restore operator" and a "change scope" button
![](/content/images/2022/05/image-30.png)
Click Change Scope, a new page will load and you will be able to see all of the data you assigned back when you created the role.
![](/content/images/2022/05/image-32.png)
Now select a scope to dive into and select the change scope button at the top of the list.

You can get into Sharepoint sites which will return you a sharepoint browser as expected.

If however you select a user then you will get their Mailbox, OneDrive and Sharepoint sites
![](/content/images/2022/05/image-34.png)
You can see above I have expaned and are viewing a mailbox folder and the OneDrive below this is also open.

### Summary

This is great. Simple to setup, gives organisations hosted in a multi tenant environment (or not) the power to perform restores WITHOUT needing to use the Global Admin account which is where we used to see queries around how they were going to monitor and assign access to this Global Admin account internally given it was not a named account against a user. Now everything is auditable.

Will we eventually build our own version of this into our self service portal that customers use on a daily basis? After seeing this I am not so sure we will rush into it - if anything it will certainly delay it. 

We can then see what the uptake is and how often it is used and then make a call. 

One thing for sure is though I will be diving into the API to see what we can do in this space to automate the creation and have the customers manage their own restore operators and onboard themselves to the restore portal.

Nice one Veeam VBO team - this is a great addition to have to this product.

