---
title: 'Veeam Backup for Office 365 REST API - 
 The object has not yet been initialized'
description: 'Are you getting a weird "Object has not yet been initialized" with a fresh install of Veeam Backup for Office365? Simple solution.'
heroImage: '/content/images/2019/05/veeam-backupo365.jpg'
slug: 'veeam-backup-for-office-365'
pubDate: '2019-05-01T23:30:36.000Z'
tags: ["veeam", "vbo", "office365", "api"] 
categories: ['veeam']
author: ["ben"]
---

### API Error

Other than logging in to generate a session token which was working OK, all other endpoints I randomally selected threw the following error. Not something I had seen in my lab environment running the Beta. Which to be fair was a fresh install of everything.

```
{
    "message": "An error has occurred.",
    "exceptionMessage": "The object has not yet been initialized. Ensure that HttpConfiguration.EnsureInitialized() is called in the application's startup code after all other initialization code.",
    "exceptionType": "System.InvalidOperationException",
    "stackTrace": "   at System.Web.Http.Routing.RouteCollectionRoute.get_SubRoutes()\r\n   at System.Web.Http.Routing.RouteCollectionRoute.GetRouteData(String virtualPathRoot, HttpRequestMessage request)\r\n   at System.Web.Http.HttpRouteCollection.GetRouteData(HttpRequestMessage request)\r\n   at System.Web.Http.Dispatcher.HttpRoutingDispatcher.SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)\r\n   at System.Net.Http.DelegatingHandler.SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)\r\n   at System.Web.Http.HttpServer.<SendAsync>d__0.MoveNext()"
}

```

### Log file shows

You can see the new RESTful services finding the plugins that were already on the server. But then throwing reference errors

```
  23/04/2019 2:01:09 PM    6 (14364) Plug-in found: C:\Program Files\Veeam\Backup and Replication\ExchangeExplorer\Veeam.Exchange.REST.dll
23/04/2019 2:01:09 PM    6 (14364) Plug-in found: C:\Program Files\Veeam\Backup and Replication\SharePointExplorer\Veeam.SharePoint.REST.dll
23/04/2019 2:01:09 PM    6 (14364) Loading plug-in: C:\Program Files\Veeam\Backup and Replication\ExchangeExplorer\Veeam.Exchange.REST.dll...
23/04/2019 2:01:09 PM    6 (14364) Failed to load plug-in
23/04/2019 2:01:09 PM    6 (14364) Error: Method 'CreateSession' in type 'Veeam.Exchange.REST.Store.RestoreSessionAdmin' from assembly 'Veeam.Exchange.REST, Version=9.6.4.1053, Culture=neutral, PublicKeyToken=null' does not have an implementation.
23/04/2019 2:01:09 PM    6 (14364) Type: System.TypeLoadException
23/04/2019 2:01:09 PM    6 (14364) Stack:
23/04/2019 2:01:09 PM    6 (14364) 
23/04/2019 2:01:09 PM    6 (14364) Error: Method 'set_UserPassword' in type 'Veeam.Exchange.REST.Representation.RESTSmtpSettingsFromClientV1' from assembly 'Veeam.Exchange.REST, Version=9.6.4.1053, Culture=neutral, PublicKeyToken=null' does not have an implementation.
23/04/2019 2:01:09 PM    6 (14364) Type: System.TypeLoadException
23/04/2019 2:01:09 PM    6 (14364) Stack:
23/04/2019 2:01:09 PM    6 (14364) 
23/04/2019 2:01:09 PM    6 (14364) Error: Method 'set_UserPassword' in type 'Veeam.Exchange.REST.Representation.RestSmtpSettingsFromClient' from assembly 'Veeam.Exchange.REST, Version=9.6.4.1053, Culture=neutral, PublicKeyToken=null' does not have an implementation.
23/04/2019 2:01:09 PM    6 (14364) Type: System.TypeLoadException
23/04/2019 2:01:09 PM    6 (14364) Stack:
23/04/2019 2:01:09 PM    6 (14364) 
23/04/2019 2:01:09 PM    6 (14364) Error: Method 'CheckCredential' in type 'Veeam.Exchange.REST.Auth.OrganizationCredentialValidator' from assembly 'Veeam.Exchange.REST, Version=9.6.4.1053, Culture=neutral, PublicKeyToken=null' does not have an implementation.
23/04/2019 2:01:09 PM    6 (14364) Type: System.TypeLoadException
23/04/2019 2:01:09 PM    6 (14364) Stack:
23/04/2019 2:01:09 PM    6 (14364) 
23/04/2019 2:01:09 PM    6 (14364) Loading plug-in: C:\Program Files\Veeam\Backup and Replication\SharePointExplorer\Veeam.SharePoint.REST.dll...
23/04/2019 2:01:09 PM    6 (14364) Failed to load plug-in
23/04/2019 2:01:09 PM    6 (14364) Error: Method 'set_UserPassword' in type 'Veeam.SharePoint.REST.Representation.RESTSmtpSettingsFromClient' from assembly 'Veeam.SharePoint.REST, Version=9.6.4.1053, Culture=neutral, PublicKeyToken=null' does not have an implementation.
23/04/2019 2:01:09 PM    6 (14364) Type: System.TypeLoadException
23/04/2019 2:01:09 PM    6 (14364) Stack:
23/04/2019 2:01:09 PM    6 (14364) 
23/04/2019 2:01:09 PM    6 (14364) Error: Method 'CreateSession' in type 'Veeam.SharePoint.REST.Database.RestoreSessionAdmin' from assembly 'Veeam.SharePoint.REST, Version=9.6.4.1053, Culture=neutral, PublicKeyToken=null' does not have an implementation.
23/04/2019 2:01:09 PM    6 (14364) Type: System.TypeLoadException
23/04/2019 2:01:09 PM    6 (14364) Stack:
23/04/2019 2:01:09 PM    6 (14364) 
23/04/2019 2:01:09 PM    6 (14364) Error: Method 'CheckCredential' in type 'Veeam.SharePoint.REST.Auth.SharePointOrganizationCredentialValidator' from assembly 'Veeam.SharePoint.REST, Version=9.6.4.1053, Culture=neutral, PublicKeyToken=null' does not have an implementation.
23/04/2019 2:01:09 PM    6 (14364) Type: System.TypeLoadException
23/04/2019 2:01:09 PM    6 (14364) Stack:
23/04/2019 2:01:09 PM    6 (14364) 
23/04/2019 2:01:09 PM    6 (14364) Temporary folder for data export: C:\Windows\TEMP\REST_VBO_REPORTS_c3c6fd33-7e95-4a8c-92bf-2099e904f06b
23/04/2019 2:01:09 PM    6 (14364) Starting service: https://+:4443...  

```

### How to fix it

The log entries saying **Plug in found** then **Failed to load plugin** missing some methods that are obviously only in the newer versions of the browsers that shipped with Veeam Backup for Office365 (not Backup and Replication).

We had this installed on an existing bit of Cloud Connect infrastructure as we are a Service Provider so having this installed on here mad sense so we can allow self-service restores for remote clients - Anthony Spiteri has an [overview here on this topic](https://anthonyspiteri.net/office-365-backups-and-the-opportunity-that-exists-for-service-providers/) here.

I tried the following:

- removed all of the old versions using the Explorer MSI's that were located in the B&R ISO file that we had installed on that server.
- reinstalled the latest explorers from the Veeam Backup for Office365 zip

Bingo. **Happy API** once again.

### Final thoughts

Not sure why the API should completely fall over if there are older versions of the plugins installed. I am sure they could either:

- handle this better and not provide the functionality (or whatever the plugins do in the API layer)

and / or

- during the install of VBO product, detect that there is an old version and tell the user to upgrade/force the upgrade.

We wouldn't normally have the browsers installed on these types of servers as we don't use this server for that function (hence we didnt upgrade when installing the server product for VBO) but they were there because of the Full B&R install co-existing on the same server.I am sure others will be in the same boat.

