---
title: 'Get File servers information via the API in Veeam v10 Enterprise Manager' 
description: 'An overview of how to retrieve information on file servers using the
/api/nas/fileServers endpoints in Veeam B&R Enterprise Manager. 

We will cover o'
heroImage: '/content/images/2020/02/fileserver-header.png'
slug: 'get-fileservers-via-the-api-in-veeam-v10-enterprise-manager'
pubDate: '2020-02-04T23:07:43.000Z'
categories: ['veeam']
author: ["ben"]
---

An overview of how to retrieve information on file servers using the /api/nas/fileServers endpoints in Veeam B&R Enterprise Manager. 

We will cover off the following on this page so move down as appropriate

- /api/nas/fileServers (File Server Index)
- /api/nas/fileServers?format=Entity (Detailed List of all File Servers)
- /api/nas/fileServers/{id}?format=Entity (Single detailed Entity fetch)

## /api/nas/fileServers

**HTTP GET**

Returns the index of file servers available. This is an array list but I only have a single file sever called **\appserver\work** at this stage

```json
    {
        "Refs": [
            {
                "Links": [
                    {
                        "Rel": "Up",
                        "Href": "https://localhost:9398/api/backupServers/7905ba33-78a5-4a34-9b3c-16bf216fdd68",
                        "Name": "appserver",
                        "Type": "BackupServerReference"
                    },
                    {
                        "Rel": "Alternate",
                        "Href": "https://localhost:9398/api/nas/fileServers/765dde91-3d01-439e-8c9a-4b23ac6909d9?format=Entity",
                        "Name": "\\\\appserver\\Work",
                        "Type": "FileServer"
                    }
                ],
                "UID": "urn:veeam:FileServer:765dde91-3d01-439e-8c9a-4b23ac6909d9",
                "Name": "\\\\appserver\\Work",
                "Href": "https://localhost:9398/api/repositories/765dde91-3d01-439e-8c9a-4b23ac6909d9",
                "Type": "FileServerReference"
            }
        ]
    }
```

## /api/nas/fileServers?format=entity

**HTTP GET**

Returns a detailed response of the file servers.

```json
{
"FileServers": [
    {
        "ServerType": "SmbServer",
        "HierarchyObjRef": "urn:NasBackup:FileServer:6ee2e771-928b-4789-9bf1-8573ceee3867.765dde91-3d01-439e-8c9a-4b23ac6909d9",
        "SmbServerOptions": {
            "Path": "\\\\appserver\\Work",
            "CredentialsId": null
        },
        "NfsServerOptions": null,
        "FileServerOptions": null,
        "ProcessingOptions": {
            "ServerUid": "urn:veeam:FileServer:765dde91-3d01-439e-8c9a-4b23ac6909d9",
            "CacheRepositoryUid": "urn:veeam:Repository:88788f9e-d8f5-4eb4-bc4f-9b3f5403bcec"
        },
        "NASServerAdvancedOptions": {
            "ProcessingMode": "Direct",
            "StorageSnapshotPath": null
        },
        "Name": "\\\\appserver\\Work",
        "UID": "urn:veeam:FileServer:765dde91-3d01-439e-8c9a-4b23ac6909d9",
        "Links": [
            {
                "Rel": "Up",
                "Href": "https://localhost:9398/api/backupServers/7905ba33-78a5-4a34-9b3c-16bf216fdd68",
                "Name": "appserver",
                "Type": "BackupServerReference"
            },
            {
                "Rel": "Alternate",
                "Href": "https://localhost:9398/api/nas/fileServers/765dde91-3d01-439e-8c9a-4b23ac6909d9",
                "Name": "\\\\appserver\\Work",
                "Type": "FileServerReference"
            }
        ],
        "Href": "https://localhost:9398/api/nas/fileServers/765dde91-3d01-439e-8c9a-4b23ac6909d9?format=Entity",
        "Type": "FileServer"
    }
]
}
```

## /api/nas/fileServers/{id}?format=Entity

HTTP GET

Returns a single file server the ID is the UID retreived via the index page without the urn:Veeam:FileServer: prefix.

```json
{
    "ServerType": "SmbServer",
    "HierarchyObjRef": "urn:NasBackup:FileServer:6ee2e771-928b-4789-9bf1-8573ceee3867.765dde91-3d01-439e-8c9a-4b23ac6909d9",
    "SmbServerOptions": {
        "Path": "\\\\appserver\\Work",
        "CredentialsId": null
    },
    "NfsServerOptions": null,
    "FileServerOptions": null,
    "ProcessingOptions": {
        "ServerUid": "urn:veeam:FileServer:765dde91-3d01-439e-8c9a-4b23ac6909d9",
        "CacheRepositoryUid": "urn:veeam:Repository:88788f9e-d8f5-4eb4-bc4f-9b3f5403bcec"
    },
    "NASServerAdvancedOptions": {
        "ProcessingMode": "Direct",
        "StorageSnapshotPath": null
    },
    "Name": "\\\\appserver\\Work",
    "UID": "urn:veeam:FileServer:765dde91-3d01-439e-8c9a-4b23ac6909d9",
    "Links": [
        {
            "Rel": "Up",
            "Href": "https://localhost:9398/api/backupServers/7905ba33-78a5-4a34-9b3c-16bf216fdd68",
            "Name": "appserver",
            "Type": "BackupServerReference"
        },
        {
            "Rel": "Alternate",
            "Href": "https://localhost:9398/api/nas/fileServers/765dde91-3d01-439e-8c9a-4b23ac6909d9",
            "Name": "\\\\appserver\\Work",
            "Type": "FileServerReference"
        }
    ],
    "Href": "https://localhost:9398/api/nas/fileServers/765dde91-3d01-439e-8c9a-4b23ac6909d9?format=Entity",
    "Type": "FileServer"
}
```



    
    

