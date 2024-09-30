---
title: 'Setting up the Audit API Notification Settings in Veeam Backup for Office365 v5' 
description: 'VBO v5 brought a new Audit feature into the final release. This sends audit
notifications for operations performed with the data backed up by a specif'
heroImage: '/content/images/2020/12/audit-notification-settings.jpg'
slug: 'audit-api-notification-setup-in-veeam-backup-for-office365'
pubDate: '2020-12-16T09:29:30.000Z'
tags: ["vbo", "api"] 
categories: ['veeam']
author: ["ben"]
---

VBO v5 brought a new Audit feature into the final release. This sends audit notifications for operations performed with the data backed up by a specified user or user of a specified group. For example you may want to receive notifications every time an HR group is restored or members of the Executive team.

This post is the first in the series and covers off how to set where the audit notifications will be sent to should and Audit event be triggered by the server.

You will need to write come code or use a tool like Postman to interact with the VBO API and set your audit preferences. 

Let's take a look at using Postman as that is the most accessible for all types of users and if you are more of the coding type then just translate the endpoints and payloads across to the language of your choice.

We need to do a few things to get this setup

- Log into the API to generate an authentication token we can use for the session
- Set (or PUT in API terminology) the desired audit settings (mail server, destination email, subject lines etc)

### Step 1

[Download Postman](http://postman.com/downloads), install it

### Step 2

Logging into the API and getting an authentication token back. In postman select the + icon on the tabbed area, or hit the +new button top let and select request.

In the address bar, select **POST**  (where GET is) and enter the url **https://yourvboserver:4443/v5/token**

It should look something like this
![](/content/images/2020/12/1-url-bar-postman.png)
Now, below this url bar we need to select a few things

Select **Body **and then select x-www-form-urlencoded and enter the following pairs off data

- grant_type = password
- username = yourusername
- password = youruserpassword

Note: the grant_type = password should actually be "password" this is NOT the password for the specified account, thats what the password item is for where I have supersecurepassword
![](/content/images/2020/12/2-login-settings.png)
Great, now hit the SEND button. All going to plan you will get a HTTP 200 (OK) response back from your VBO servers API with something that looks like this.
![](/content/images/2020/12/3-acess-token.png)
Now, the value we are interested is the access_token (the big long string on my example starting with AQAAAA and ending down with 801Q). Copy this as you will need it in a minute.

## Step 3

Now we have logged in we can set our audit notification settings. The official documentation [for v5.0 is here](https://helpcenter.veeam.com/docs/vbo365/rest/put_vbo_audit_settings.html?ver=50).

The sample JSON payload (more on this in a minute) they provide is as follows
```json
    {
    
     "enableNotification": "true",
    
     "smtpServer": "smtp.office365.com",
    
     "port": 590,
    
     "useAuthentication": "true",
    
     "username": "john.smith@tech.com",
    
     "useSSL": "true",
    
     "from": "vbo@tech.com",
    
     "to": "admin@tech.com",
    
     "subject": "[Audit] %OrganizationName% - %DisplayName% - %Action% initiated by %InitiatedByUserName% at %StartTime%"
    
    }
```
    
    I will be modifying mine a little to talk to a local mail relay without authentication for now so my payload is going to look like the following
 
 ```json
  {
        
         "enableNotification": "true",
        
         "smtpServer": "mailserver.youngs.local",
        
         "port": 587,
        
         "useAuthentication": "false",
        
         "username": "",
        
         "useSSL": "true",
        
         "from": "vbo.audit@benyoung.blog",
        
         "to": "security.officer@benyoung.blog",
        
         "subject": "[Audit] %OrganizationName% - %DisplayName% - %Action% initiated by %InitiatedByUserName% at %StartTime%"
        
        }
```
        
You can customise the subject with the placeholders between the %'s. I will leave it as the default but this would be useful if you were trying to have a system such as a service desk or even mail rules that require you to have a certain format.

Ok, onto setting it up. With the payload customised to meet your needs, create a new request in Postman llike you did before. Select the **GET to PUT ** this time.

The URL we want in the address bar is going to be **https://yourvboserver:4443/v5/auditemailsettings**

Select **Authorization** below the url bar, now you can select **Bearer Token** as the type and in the token field enter the **access_token** from step2
![](/content/images/2020/12/authorization.png)
Now select **Body **and this time we want the **raw** option with the type selected as JSON (usually defaults to text)

Paste your JSON into the empty box so it looks like the following
![](/content/images/2020/12/4-put-audit-settings.png)
Hit that send button again! and if you got a http 200 (OK) response back your settings were set, it will also be verified as you will get a payload back with the data you just submitted with some additional bits.
![](/content/images/2020/12/put-ok.png)
That's it. And by enabling this setting the Veeam Backup for Office365 server will send a test email which will notify you that it's been enabled. 
![](/content/images/2020/12/email-notification.png)
Now you are ready to setup some audit items for users/groups of an organisation you manage. Until then the server will not trigger anything. 

> [Part 2 shows you how to set users/groups up](/get-a-notification-when-restricted-user-data-is-accessed-in-veeam-backup-for-office365/) for alerting when data is accessed. 


And for extra points, dive into the [Managing Audit Items](https://helpcenter.veeam.com/docs/vbo365/rest/audititems.html?ver=50) documentation.




