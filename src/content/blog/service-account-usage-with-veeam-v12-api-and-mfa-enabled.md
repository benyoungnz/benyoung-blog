---
title: 'Service account usage with Veeam V12 API and MFA enabled' 
description: 'Service account usage is commonly used when machine-to-machine communication is
required. Remember when I said the first thing you should do with Veea'
heroImage: '/content/images/2022/10/veeam-v12-mfa-bypass.jpg'
slug: 'service-account-usage-with-veeam-v12-api-and-mfa-enabled'
pubDate: '2022-10-02T23:12:31.000Z'
tags: ["veeam", "api", "security"] 
categories: ['veeam']
author: ["ben"]
---

Service account usage is commonly used when machine-to-machine communication is required. Remember when I said the first thing you should do with [Veeam v12 is enable MFA/two factor](https://benyoung.blog/protect-your-veeam-console-by-enabling-mfa/) authentication? (this is still true) 

But, machines are not so good at the second factor side of things so typically you will have API keys or in V12's case you will configure a service account that bypasses the MFA side of things - so be extra careful with these credentials and don't leave them unencrypted in config files etc.

First, what happens when I try to authenticate against the V12 API with my MFA enabled account?  We post to the **/api/oauth2/token** our credentials and grant_type of password, as expected, it fails
![](/content/images/2022/10/image.png)
This is also mirrored on the server side. Typically - C:\ProgramData\Veeam\Backup\Svc.ResAPI.log
```
[03.10.2022 11:48:31.999] <36> Info         [User: Anonymous][POST] request to [/api/oauth2/token] deserialized. Message: [grant_type=password&username=benyoung&password=****]; Parameters: [x-api-version: 1.0-rev1; Postman-Token: bb753b8d-214b-4f4a-8ab6-fa8e57a110c8; Connection: keep-alive; Content-Length: 63; Content-Type: application/x-www-form-urlencoded; Accept: */*; Accept-Encoding: gzip, deflate, br; Host: 172.30.6.5:9419; User-Agent: PostmanRuntime/7.28.3; ].
[03.10.2022 11:48:32.008] <36> Info         Current license edition is EnterprisePlus. Checking expiration and type...
[03.10.2022 11:48:32.012] <36> Info         Authenticated user: [.\benyoung]
[03.10.2022 11:48:32.071] <36> Error        Login failed for user 'benyoung'.
[03.10.2022 11:48:32.072] <36> Error        Failed to create access token.
[03.10.2022 11:48:32.072] <36> Error        Authentication failed (System.Security.Authentication.AuthenticationException)
...removed the error stack...
[03.10.2022 11:48:32.072] <08> Info         [POST /api/oauth2/token]: [401] {"errorCode":"AccessDenied","message":"Authentication failed","resourceId":null}

```

Ok well that is GOOD. Let's get it up and running with a service account then eh?

### Setting up a service account

Create the account wherever you need such as Active Directory or locally. This is my demo BETA lab so I am just going to create a local account on the backup server itself named **apiaccount**
![](/content/images/2022/10/image-1.png)
Now fire up the Veeam Console and get to the users and roles section
![](/content/images/2022/10/image-2.png)
Select add user, enter the name of the account you have already provisioned. Make sure you select the appropriate role, only providing the level of access you NEED next to point 1.

Now point 2 below is the important bit - check the "this is a service account" box, followed by OK.
![](/content/images/2022/10/image-3.png)
The account is then added. 
![](/content/images/2022/10/image-4.png)
One thing that would be really nice from Veeam's perspective is for this to be highlighted in some way, like an icon or colour indicating that this account does NOT required MFA. I'll log this back through the BETA feedback loop now.

Now, throwing the credentials into a web request we hit that same /api/oauth2/token endpoint with the service account details and we get a token for use! yeehaw.
![](/content/images/2022/10/image-5.png)

