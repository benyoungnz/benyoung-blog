---
title: 'Get a notification when restricted user data is accessed in Veeam Backup for Office365' 
description: 'Ensuring that you have an audit trail is very important when it comes to your
backup data. Who accessed what and when. In Veeam Backup for Office365 v'
heroImage: '/content/images/2021/01/data-access-audit-log-veeam.jpg'
slug: 'get-a-notification-when-restricted-user-data-is-accessed-in-veeam-backup-for-office365'
pubDate: '2021-01-05T21:15:07.000Z'
tags: ["vbo", "api", "office365"] 
categories: ['veeam']
author: ["ben"]
---

Ensuring that you have an audit trail is very important when it comes to your backup data. Who accessed what and when. In Veeam Backup for Office365 v5 there is a new Audit feature allowing you to setup email notifications to be generated when users (or groups) you have specified have their data accessed.

> *This is part 2 *- **you will want to [visit part 1 here](https://benyoung.blog/audit-api-notification-setup-in-veeam-backup-for-office365/)** if you have not as it explains how to get session tokens and use Postman for driving the API and setting up your email routes as this cannot currently be set via the VBO console (gui).

Ok, let's take a simple example of protecting my own mailbox and have it send audit alerts when "simon service" account accesses my data via the explorers.

First login to get you session token (remember to read part 1 if this looks foreign).
![](/content/images/2021/01/1-session-token.png)
Now, use your access_token for all future requests under Authorization tab, bearer token like so
![](/content/images/2021/01/2-bearer-token.png)
Get your organisations via a GET to **/v5/organizations **and your organisations will be returned.

We need the **organization's ID** as highlighted below.
![](/content/images/2021/01/3-organization-list.png)
You will in that returned payload see a link to the users under the _links section. But we can get there by firing a new request off too /v5/organizations/{organisationid}/users.

> Pro tip here, you can append ?limit=XXX in the URL to change from the default 30 that is returned. 

In our example then we want to GET /v5/organizations/6f144e6f-7f59-475f-8e1d-1bfa0b6bb020/users?limit=100

I can then find my user id as below (note in postman you can search top right of the payload returned)
![](/content/images/2021/01/4-user-list.png)
Ok, nearly there now that we have the users payload we want to POST my user data to the /v5/organizations/{organisationid}/AuditItems endpoint with the following template

    {
      "type": "user",
      "user": {
        "id": "userid",
        "displayName": "displayname",
        "name": "accountname"
        }
    }
    
    
    ```
    
    So, given what we returned via the organisations and users endpoints our payload for my user look like the following
    
        {
          "type": "user",
          "user": {
            "id": "fafba54d-7ec0-4066-b96d-13be036200f800000000-0000-0000-0000-000000000000AQUAAAAAAAUVAAAAervaJPfu-8CbZ-GQjggAAA",
            "displayName": "Ben Young",
            "name": "ben.young@vbridge.co.nz"
            }
        }
        
        ```
        
        > **Important: **This endpoint expects **an array **to be posted. It is designed this way so you can have multiple user accounts or even some users and a group etc. so may sure your JSON payload starts with [ and ends with ]. You can seperate out different users / groups with a comma
        
        
        My final payload to be sent to the AuditItems endpoint in this case given I am only interested in auditing a single user is as follows (note the [ and ]) and that the body type is raw with JSON set as the content type.
        
            [
            {
              "type": "user",
              "user": {
                "id": "fafba54d-7ec0-4066-b96d-13be036200f800000000-0000-0000-0000-000000000000AQUAAAAAAAUVAAAAervaJPfu-8CbZ-GQjggAAA",
                "displayName": "Ben Young",
                "name": "ben.young@vbridge.co.nz"
                }
            }
            ]
            
            ```
            
            POST this data to your endpoint. In my case **/v5/organizations/6f144e6f-7f59-475f-8e1d-1bfa0b6bb020/AuditItems** and you will receive and OK response back but no content returned.
            ![](/content/images/2021/01/5-audit-posted-ok.png)
            To confirm (or to check in the future) what Audit Items you have set against an organisation you can simply GET to /v5/organizations/{organizationid}/AuditItems 
            
            Let's check what we have set by GET'ing the endpoint.
            ![](/content/images/2021/01/6-confirming-settings.png)
            Ok, time to get "simon service" to access my data. I login to the console via this account as below to simulate another user.
            ![](/content/images/2021/01/7-simon-service.png)
            And i then right click my exchange job, select Explore latest restore point.
            ![](/content/images/2021/01/8-access-exchange-data.png)
            I find my Ben Young protected user and get some emails to list out
            ![](/content/images/2021/01/9-access-user-email.png)
            Now let's export some data from this protected user
            ![](/content/images/2021/01/10-export-email.png)
            And here we go, this just popped into the security officer's mailbox. An alert for each accessed item that we exported via simon service and where we put it. (i have only included a single email shot below but i got 5 alerts)
            ![](/content/images/2021/01/11-alert-generated.png)
            The really neat thing here is that even if someone doesn't export/restore the data but just **views** it via the explorer you also get an alert.
            ![](/content/images/2021/01/12-view-only-alert.png)
            What do you think? Pretty neat and very powerful feature. 
            
            I would love to see this feature expanded in the future were you could setup alert webhooks directly to your systems or even be able to poll the restful API for audit items that were generated. For now you will need to setup some email rules/flow/integration to get it into your systems if you need too - thankfully very easy these days.
            
        
        
    
    

