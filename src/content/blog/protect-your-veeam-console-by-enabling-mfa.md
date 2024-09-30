---
title: 'Protect your Veeam console by enabling MFA' 
description: 'V12 is due out soon and for me two-factor login support is one of the best new
features and it will literally take you 2 minutes or less to configure '
heroImage: '/content/images/2022/09/veeam-v12-mfa-enable.jpg'
slug: 'protect-your-veeam-console-by-enabling-mfa'
pubDate: '2022-09-29T22:34:40.000Z'
tags: ["security", "vbr"] 
categories: ['veeam']
author: ["ben"]
---

V12 is due out soon and for me two-factor login support is one of the best new features and it will literally take you 2 minutes or less to configure so there is no excuse. 

We all know by now how important MFA is for all aspects of our digital life - we enable it on various SaaS platforms, our email and everything in between.

This should be the **first thing you do** when you upgrade to v12. Your backup environment contains your critical business data. 

### Step 1 - Open the console, get to users

This is an easy one, fire up users and roles.
![](/content/images/2022/09/image.png)
Depending if this is a new server or now you may have various users or groups enabled already.

This is a new build so by default has the Administrators group added. We will remove this, see below;
![](/content/images/2022/09/image-1.png)
You will need to remove any groups and add any users into the required roles since MFA can only be enabled to a user, not a group. 

You can enable entries here to bypass such as service accounts, to do this edit the user and enable the checkbox below.
![](/content/images/2022/09/image-4.png)
For my lab here I am going to add a local user (not in the Local Administrators) group and this is what I will be using to login to do the backup administration. And I will also add the Administrator user as a backup admin.
![](/content/images/2022/09/image-9.png)
### Step 2 - Enable MFA for interactive login 

Below the user list is this little button to enable two-factor authentication for interactive logon - enable it
![](/content/images/2022/09/image-2.png)
Additionally I think it is worth enabling the Enable auto logoff as additional security measures, set to a desired time frame, 10 minutes seems reasonable. 
![](/content/images/2022/09/image-3.png)
Now select OK and close the console.

### Step 3 - First time setup

Logon with your user credentials
![](/content/images/2022/09/image-10.png)
Upon first login you will now be prompted to setup MFA. The method is TOTP based so any authenticator such as Google, Microsoft and various password managers will be supported. 

I am going to add this to my Google Authenticator, to this by either 

1. Scanning the QR code
2. Entering the code directly

![](/content/images/2022/09/image-11.png)
A new entry will be added with the 6 digit code being displayed
![](/content/images/2022/09/image-13.png)
Click Next and enter the code being displayed on your app, followed by confirm
![](/content/images/2022/09/image-14.png)
The B&R server will now confirm this is correct and provided the correct code is entered you will be granted access.

Things to check if this doesn't work at first is that the time from the device providing the MFA code on the authenticator app matches the server time - there is not much tolerance for time drift so most issues with TOTP codes are typically due to say the phone being a minute or so out from the server.

Easy as that. 

