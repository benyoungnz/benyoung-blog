---
title: 'API Changes in Veeam Backup for Office365 v5' 
description: 'If you utilise the Veeam Backup for Microsoft Office365 API here is summary of
the changes between version 4 and version 5 of the API.

There may be a'
heroImage: 'https://images.unsplash.com/photo-1547954575-855750c57bd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxMTc3M3wwfDF8c2VhcmNofDMzfHxjb2RlfGVufDB8fHw&ixlib=rb-1.2.1&q=80&w=1080'
slug: 'api-changes-in-veeam-backup-for-office365-v5'
pubDate: '2020-12-08T22:03:27.000Z'
tags: ["vbo", "api"] 
categories: ['veeam']
author: ["ben"]
---

If you utilise the Veeam Backup for Microsoft Office365 API here is summary of the changes between version 4 and version 5 of the API.

**There may be a few discrepancies **as I have had to clean up the swagger files manually a little bit to try make this generate things like renaming the v4 route to v5. So will adjust this if/when i get any constructive feedback.... 

Looks good and you can see a bunch of new endpoints around Teams which is unsurprising given it is new to this release. Also a of the changed endpoints were cleaning up route identifiers i.e /Jobs/{id} is now /Jobs/{jobId} which makes it a lot cleaner.

## Version v4 to v5

---

### What's New

---

- `GET` /v5/AuditEmailSettings
- `PUT` /v5/AuditEmailSettings
- `POST` /v5/AuditEmailSettings/action
- `GET` /v5/BackupRepositories/{repositoryId}/TeamData
- `GET` /v5/BackupRepositories/{repositoryId}/TeamData/{teamId}
- `GET` /v5/License
- `POST` /v5/License/action
- `GET` /v5/licensing/reports/latest
- `DELETE` /v5/LicensedUsers/{licensedUserId}
- `GET` /v5/Organizations/{organizationId}/AuditItems
- `POST` /v5/Organizations/{organizationId}/AuditItems
- `POST` /v5/Organizations/{organizationId}/AuditItems/action
- `GET` /v5/Organizations/{organizationId}/Teams
- `GET` /v5/Organizations/{organizationId}/Teams/{teamId}
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/channels
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/channels/{channelId}
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/channels/{channelId}/action
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/files
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/files/{fileId}
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/files/action
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/files/{fileId}/action
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/posts
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/posts/{postId}
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/posts/action
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/posts/{postId}/action
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/channels/{channelId}/tabs
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/channels/{channelId}/tabs/{tabId}
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/channels/{channelId}/tabs/action
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/channels/{channelId}/tabs/{tabId}/action
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams
- `GET` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/action
- `POST` /v5/RestoreSessions/{restoreSessionId}/organization/teams/{teamId}/action
- `GET` /v5/VetEmailSettings
- `PUT` /v5/VetEmailSettings
- `POST` /v5/VetEmailSettings/action

### What's Deprecated

---

- `DELETE` /v5/Proxies/{proxyId}

### What's Changed

---

`GET` /v5/BackupRepositories/{repositoryId}/GroupData/{groupId}

Parameters

```
    Add groupId
    Delete id

```

`GET` /v5/BackupRepositories/{repositoryId}/UserData/{userId}

Parameters

```
    Add userId
    Delete id

```

`PUT` /v5/Jobs/{jobId}

Parameters

```
    Add jobId
    Delete id

```

`DELETE` /v5/Jobs/{jobId}

Parameters

```
    Add jobId
    Delete id

```

`GET` /v5/Jobs/{jobId}

Parameters

```
    Add jobId
    Delete id

```

`POST` /v5/Jobs/{jobId}/SelectedItems

Parameters

```
    Add jobId
    Delete id

```

`DELETE` /v5/Jobs/{jobId}/SelectedItems

Parameters

```
    Add jobId
    Delete id

```

`GET` /v5/Jobs/{jobId}/SelectedItems

Parameters

```
    Add jobId
    Delete id

```

`PUT` /v5/Jobs/{jobId}/SelectedItems/{itemId}

Parameters

```
    Add jobId
    Delete id

```

`GET` /v5/Jobs/{jobId}/SelectedItems/{itemId}

Parameters

```
    Add jobId
    Delete id

```

`POST` /v5/Jobs/{jobId}/ExcludedItems

Parameters

```
    Add jobId
    Delete id

```

`DELETE` /v5/Jobs/{jobId}/ExcludedItems

Parameters

```
    Add jobId
    Delete id

```

`GET` /v5/Jobs/{jobId}/ExcludedItems

Parameters

```
    Add jobId
    Delete id

```

`PUT` /v5/Jobs/{jobId}/ExcludedItems/{itemId}

Parameters

```
    Add jobId
    Delete id

```

`GET` /v5/Jobs/{jobId}/ExcludedItems/{itemId}

Parameters

```
    Add jobId
    Delete id

```

`GET` /v5/JobSessions

Parameters

```
    Add limit
    Add offset
Return Type

    Insert offset
    Insert limit
    Insert totalCount
    Insert results
    Insert _links

```

`GET` /v5/Jobs/{jobId}/JobSessions

Parameters

```
    Add limit
    Add offset

```

`GET` /v5/LicensedUsers

Parameters

```
    Add name

```

`PUT` /v5/Organizations/{organizationId}

Parameters

```
    Add organizationId
    Delete id

```

`DELETE` /v5/Organizations/{organizationId}

Parameters

```
    Add organizationId
    Delete id

```

`GET` /v5/Organizations/{organizationId}

Parameters

```
    Add organizationId
    Delete id

```

`GET` /v5/Organizations/{organizationId}/usedRepositories

Parameters

```
    Add organizationId
    Delete id

```

`PUT` /v5/Organizations/{organizationId}/BackupAccounts

Parameters

```
    Add organizationId
    Delete id

```

`GET` /v5/Organizations/{organizationId}/BackupAccounts

Parameters

```
    Add organizationId
    Delete id

```

`GET` /v5/Organizations/{organizationId}/Groups

Parameters

```
    Delete name

```

`GET` /v5/Organizations/{organizationId}/LicensingInformation

Parameters

```
    Add organizationId
    Delete id

```

`GET` /v5/Organizations/{organizationId}/Users

Parameters

```
    Delete name

```

`GET` /v5/RestoreSessions/{restoreSessionId}/Events

Parameters

```
    Add limit
    Add offset

```

