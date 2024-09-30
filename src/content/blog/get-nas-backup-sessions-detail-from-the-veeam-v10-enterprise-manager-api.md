---
title: 'Get NAS backup sessions detail from the Veeam v10 Enterprise Manager API'
description: 'Overview of how to fetch NAS backup job sessions using the Veeam API using the new /api/NAS endpoints and an alternate method using the query service + filters'
heroImage: '/content/images/2020/02/job-session-header.png'
slug: 'get-nas-backup-sessions-detail-from-the-veeam-v10-enterprise-manager-api'
pubDate: '2020-02-04T23:34:03.000Z'
tags: ["veeam", "v10", "api"] 
categories: ['veeam']
author: ["ben"]
---

Overview of how to fetch NAS backup job sessions using the Veeam API using the new /api/NAS endpoints and an alternate method using the query service + filters.

I will cover off

- How to return a list of NAS backup sessions
- Alternate method of getting backup sessions (using the query service and filters)
- View detailed information on the backup session

## /api/nas/backupSessions

**HTTP GET**

This returns an index of job sessions that have originated from NAS backup job. You can see in the response below I have two job sessions (each time a job runs) for the same job called Archived Projects.

> Although this supports appending the ?format=Entity the responses will start getting very large when you have a lot of sessions being returned so i would recommend using this as your index and fetch detailed as required.

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
                        "Rel": "Up",
                        "Href": "https://localhost:9398/api/jobs/70073b98-098b-4046-a097-43cbda67d58a",
                        "Name": "Archived Projects",
                        "Type": "JobReference"
                    },
                    {
                        "Rel": "Alternate",
                        "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233?format=Entity",
                        "Name": "Archived Projects@2020-02-04 08:12:19",
                        "Type": "BackupJobSession"
                    },
                    {
                        "Rel": "Down",
                        "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233/taskSessions",
                        "Name": null,
                        "Type": "BackupTaskSessionReferenceList"
                    }
                ],
                "UID": "urn:veeam:BackupJobSession:821cc74e-9447-40b6-a2df-90aa47101233",
                "Name": "Archived Projects@2020-02-04 08:12:19",
                "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233",
                "Type": "BackupJobSessionReference"
            },
            {
                "Links": [
                    {
                        "Rel": "Up",
                        "Href": "https://localhost:9398/api/backupServers/7905ba33-78a5-4a34-9b3c-16bf216fdd68",
                        "Name": "appserver",
                        "Type": "BackupServerReference"
                    },
                    {
                        "Rel": "Up",
                        "Href": "https://localhost:9398/api/jobs/70073b98-098b-4046-a097-43cbda67d58a",
                        "Name": "Archived Projects",
                        "Type": "JobReference"
                    },
                    {
                        "Rel": "Alternate",
                        "Href": "https://localhost:9398/api/backupSessions/421c48b7-8ed4-49eb-8b0f-cacebac5fecb?format=Entity",
                        "Name": "Archived Projects@2020-02-04 09:00:02",
                        "Type": "BackupJobSession"
                    },
                    {
                        "Rel": "Down",
                        "Href": "https://localhost:9398/api/backupSessions/421c48b7-8ed4-49eb-8b0f-cacebac5fecb/taskSessions",
                        "Name": null,
                        "Type": "BackupTaskSessionReferenceList"
                    }
                ],
                "UID": "urn:veeam:BackupJobSession:421c48b7-8ed4-49eb-8b0f-cacebac5fecb",
                "Name": "Archived Projects@2020-02-04 09:00:02",
                "Href": "https://localhost:9398/api/backupSessions/421c48b7-8ed4-49eb-8b0f-cacebac5fecb",
                "Type": "BackupJobSessionReference"
            }
        ]
    }
    
    ```
    
    ### Using the Query Service (querySvc) to retrieve the backup sessions for NAS
    
    **HTTP GET**
    
    You can easily use the query svc to return backup sessions. Using the filter functionality you can ensure you only return the job types that have a value of NasBackup
    
    We will be using the following url
    
    > /api/query?**type=BackupJobSession**&sortAsc=name&pageSize=15&page=1&**filter=JobType==NasBackup**
    
    
    The portions in bold above are important
    
    - The type=BackupJobSession tells the query service we want to return backup job session entities
    - The Filter=JobType==NasBackup tells the query service to filter those backup job sessions to type NasBackup (as there could/will likely be other jobs like traditional backups for virtual machines)
    
    
    You then get a slightly different index back which you can use to get more information using the /api/backupSessions/{id} endpoint referenced further down the page.
    
    *Note: you can also append the format=Entities to return detailed responses here by i prefer not to in most cases.*
    
        {
            "Refs": {
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
                                "Rel": "Up",
                                "Href": "https://localhost:9398/api/jobs/70073b98-098b-4046-a097-43cbda67d58a",
                                "Name": "Archived Projects",
                                "Type": "JobReference"
                            },
                            {
                                "Rel": "Alternate",
                                "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233?format=Entity",
                                "Name": "Archived Projects@2020-02-04 08:12:19",
                                "Type": "BackupJobSession"
                            },
                            {
                                "Rel": "Down",
                                "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233/taskSessions",
                                "Name": null,
                                "Type": "BackupTaskSessionReferenceList"
                            }
                        ],
                        "UID": "urn:veeam:BackupJobSession:821cc74e-9447-40b6-a2df-90aa47101233",
                        "Name": "Archived Projects@2020-02-04 08:12:19",
                        "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233",
                        "Type": "BackupJobSessionReference"
                    },
                    {
                        "Links": [
                            {
                                "Rel": "Up",
                                "Href": "https://localhost:9398/api/backupServers/7905ba33-78a5-4a34-9b3c-16bf216fdd68",
                                "Name": "appserver",
                                "Type": "BackupServerReference"
                            },
                            {
                                "Rel": "Up",
                                "Href": "https://localhost:9398/api/jobs/70073b98-098b-4046-a097-43cbda67d58a",
                                "Name": "Archived Projects",
                                "Type": "JobReference"
                            },
                            {
                                "Rel": "Alternate",
                                "Href": "https://localhost:9398/api/backupSessions/421c48b7-8ed4-49eb-8b0f-cacebac5fecb?format=Entity",
                                "Name": "Archived Projects@2020-02-04 09:00:02",
                                "Type": "BackupJobSession"
                            },
                            {
                                "Rel": "Down",
                                "Href": "https://localhost:9398/api/backupSessions/421c48b7-8ed4-49eb-8b0f-cacebac5fecb/taskSessions",
                                "Name": null,
                                "Type": "BackupTaskSessionReferenceList"
                            }
                        ],
                        "UID": "urn:veeam:BackupJobSession:421c48b7-8ed4-49eb-8b0f-cacebac5fecb",
                        "Name": "Archived Projects@2020-02-04 09:00:02",
                        "Href": "https://localhost:9398/api/backupSessions/421c48b7-8ed4-49eb-8b0f-cacebac5fecb",
                        "Type": "BackupJobSessionReference"
                    }
                ]
            },
            "Entities": null,
            "Resources": null,
            "Links": null,
            "PagingInfo": {
                "Links": [
                    {
                        "Rel": "First",
                        "Href": "https://localhost:9398/api/query?type=BackupJobSession&sortAsc=name&pageSize=15&page=1&filter=JobType%3d%3dNasBackup",
                        "Name": null,
                        "Type": null
                    },
                    {
                        "Rel": "Last",
                        "Href": "https://localhost:9398/api/query?type=BackupJobSession&sortAsc=name&pageSize=15&page=1&filter=JobType%3d%3dNasBackup",
                        "Name": null,
                        "Type": null
                    }
                ],
                "PageNum": 1,
                "PageSize": 15,
                "PagesCount": 1
            }
        }
        
        
        ```
        
        ## /api/backupSessions/{id}?format=Entity
        
        **HTTP GET**
        
        This is not a new endpoint and is infact the endpoint for backupSessions that has been in Enterprise manager for a long time. The ID portion of the URL is from the UID of the job session without the urn:veeam:BackupJobSessions: prefix.
        
        It returns information on a single job session (job run) for a job. You can see things like the state, results, start/stop time. If it is still running you will actually receive the percentange complete etc which is handy for tracking running jobs.
        
            {
                "IsRetry": false,
                "JobUid": "urn:veeam:Job:70073b98-098b-4046-a097-43cbda67d58a",
                "JobName": "Archived Projects",
                "JobType": "NasBackup",
                "CreationTimeUTC": "2020-02-04T08:12:19.453Z",
                "EndTimeUTC": "2020-02-04T08:47:10.64Z",
                "State": "Stopped",
                "Result": "Success",
                "Progress": 100,
                "FailureMessage": null,
                "Name": "Archived Projects@2020-02-04 08:12:19",
                "UID": "urn:veeam:BackupJobSession:821cc74e-9447-40b6-a2df-90aa47101233",
                "Links": [
                    {
                        "Rel": "Up",
                        "Href": "https://localhost:9398/api/backupServers/7905ba33-78a5-4a34-9b3c-16bf216fdd68",
                        "Name": "appserver",
                        "Type": "BackupServerReference"
                    },
                    {
                        "Rel": "Up",
                        "Href": "https://localhost:9398/api/jobs/70073b98-098b-4046-a097-43cbda67d58a",
                        "Name": "Archived Projects",
                        "Type": "JobReference"
                    },
                    {
                        "Rel": "Alternate",
                        "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233",
                        "Name": "Archived Projects@2020-02-04 08:12:19",
                        "Type": "BackupJobSessionReference"
                    },
                    {
                        "Rel": "Down",
                        "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233/taskSessions",
                        "Name": null,
                        "Type": "BackupTaskSessionReferenceList"
                    },
                    {
                        "Rel": "Stop",
                        "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233?action=stop",
                        "Name": null,
                        "Type": null
                    }
                ],
                "Href": "https://localhost:9398/api/backupSessions/821cc74e-9447-40b6-a2df-90aa47101233?format=Entity",
                "Type": "BackupJobSession"
            }
            
            
            ```
            
        
        
    
    

