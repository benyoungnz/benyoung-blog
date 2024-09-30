---
title: 'Veeam v10 API NAS Endpoints Overview'
description: 'With the introduction of the NAS backup functionality in Veeam B&R v10 there are some new endpoints available in the Enterprise Manager API under /api/nas. '
heroImage: '/content/images/2020/02/rest-overview-header.png'
slug: 'veeam-v10-api-nas-endpoints-overview'
pubDate: '2020-02-04T22:25:50.000Z'
tags: ["veeam", "v10", "api"] 
categories: ['veeam']
author: ["ben"]
---

With the introduction of the NAS backup functionality in Veeam B&R v10 there are some new endpoints available in the Enterprise Manager API under /api/nas. 

## /api/nas

Returns a list of resource references for available endpoints

These are listed below. I have broken out each into a seperate blog to make consumption a little easier. Click any of the following links to view that.

- [Jobs list/detail using the  */api/nas/jobs* endpoints](/get-nas-jobs-via-the-api-in-veeam-v10-enterprise-manager/)
- [File server list/detail using the */api/nas/fileServers* endpoints](/get-fileservers-via-the-api-in-veeam-v10-enterprise-manager/)
- [Backup job session detail using */api/nas/backupSessions* or the query service](/get-nas-backup-sessions-detail-from-the-veeam-v10-enterprise-manager-api/)

All of these also have the **?format=entity** querystring which can be appended to return a more detailed model/response.

**Example**

    {
        "Links": [
            {
                "Rel": "Down",
                "Href": "https://localhost:9398/api/nas/jobs",
                "Name": null,
                "Type": "JobReferenceList"
            },
            {
                "Rel": "Down",
                "Href": "https://localhost:9398/api/nas/fileServers",
                "Name": null,
                "Type": "FileServerReferenceList"
            },
            {
                "Rel": "Down",
                "Href": "https://localhost:9398/api/nas/backupSessions",
                "Name": null,
                "Type": "BackupJobSessionReferenceList"
            },
            {
                "Rel": "Down",
                "Href": "https://localhost:9398/api/nas/jobs?format=Entity",
                "Name": null,
                "Type": "JobList"
            },
            {
                "Rel": "Down",
                "Href": "https://localhost:9398/api/nas/fileServers?format=Entity",
                "Name": null,
                "Type": "FileServerList"
            },
            {
                "Rel": "Down",
                "Href": "https://localhost:9398/api/nas/backupSessions?format=Entity",
                "Name": null,
                "Type": "BackupJobSessionList"
            }
        ],
        "Href": null,
        "Type": null
    }
    
    
    ```
    

