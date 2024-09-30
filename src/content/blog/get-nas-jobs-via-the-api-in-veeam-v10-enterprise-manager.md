---
title: 'Get NAS Jobs via the API in Veeam v10 Enterprise Manager'
description: 'An overview of the responses for the /api/nas/jobs endpoints in Veeam B&R Enterprise Manager'
heroImage: '/content/images/2020/02/jobs-header.png'
slug: 'get-nas-jobs-via-the-api-in-veeam-v10-enterprise-manager'
pubDate: '2020-02-04T22:50:18.000Z'
tags: ["veeam", "v10", "api"] 
categories: ['veeam']
author: ["ben"]
---

An overview of the responses for the /api/nas/jobs endpoints in Veeam B&R Enterprise Manager

We will cover off the following on this page so move down as appropriate

- /api/nas/jobs *(Job Index)*
- /api/nas/jobs?format=Entity *(Detailed List of all Jobs)*
- /api/nas/jobs/{id}?format=Entity *(Single detailed Entity fetch)*

## /api/nas/jobs

**HTTP GET**

Returns the index of jobs available. This is an array but I only have a single job called **Archived Projects** at this stage.

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
                        "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a?format=Entity",
                        "Name": "Archived Projects",
                        "Type": "Job"
                    },
                    {
                        "Rel": "Down",
                        "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/backupSessions",
                        "Name": null,
                        "Type": "BackupJobSessionReferenceList"
                    }
                ],
                "UID": "urn:veeam:NasJob:70073b98-098b-4046-a097-43cbda67d58a",
                "Name": "Archived Projects",
                "Href": "https://localhost:9398/api/agents/jobs/70073b98-098b-4046-a097-43cbda67d58a",
                "Type": "NasJobReference"
            }
        ]
    }
    
    
    ```
    
    ## /api/nas/jobs?format=Entity
    
    **HTTP GET**
    
    This returns the more detailed model. If you have seen my previous post about creating a NAS backup jobs you can see where the wizard feeds the data into this schema.
    
    This returns an array of jobs. In the example below I only have a single job.
    
    > **Note:** Expect this response to get large if you are using the ?format=entity. I would recommend returning a list of the jobs without the ?format=entity then using the /api/nas/jobs/{id}?format=Entity to retrieve it if you need the detail.
    
    
        {
            "NASJobs": [
                {
                    "Description": "Created by YOUNGS\\administrator at 4/02/2020 9:07 PM.",
                    "Includes": {
                        "NASObjects": [
                            {
                                "HierarchyObjRef": "urn:NasBackup:BackupServer:6ee2e771-928b-4789-9bf1-8573ceee3867",
                                "ObjectInJobId": "bdddfd2f-ca6f-49d9-94b6-920801260a83",
                                "FileOrFolder": "\\\\appserver\\Work\\Development Transfer",
                                "FileServerUid": "urn:veeam:FileServer:765dde91-3d01-439e-8c9a-4b23ac6909d9",
                                "InclusionMask": {
                                    "Extensions": [
                                        "*.*"
                                    ]
                                },
                                "ExclusionMask": null,
                                "Links": null,
                                "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/includes/bdddfd2f-ca6f-49d9-94b6-920801260a83",
                                "Type": "NasObject"
                            }
                        ]
                    },
                    "StorageOptions": {
                        "BackupRepositoryUid": "urn:veeam:Repository:88788f9e-d8f5-4eb4-bc4f-9b3f5403bcec",
                        "ShorttermRetentionType": "Day",
                        "ShorttermRetentionPeriod": 7,
                        "LongtermRetentionEnabled": false,
                        "KeepFileVersionsHistoryOptions": null,
                        "AdvancedStorageOptions": {
                            "ACL": {
                                "FileAttributesChangeTrackingMode": "TrackOnlyFolderAttributesChanges"
                            }
                        }
                    },
                    "ScheduleConfigured": true,
                    "ScheduleEnabled": true,
                    "NextRun": "2020-02-05T09:00:00Z",
                    "JobScheduleOptions": {
                        "Standart": {
                            "RetryOptions": {
                                "RetryTimes": 3,
                                "RetryTimeout": 10,
                                "RetrySpecified1": true
                            },
                            "WaitForBackupCompletion": true,
                            "BackupCompetitionWaitingPeriodMin": 180,
                            "OptionsDaily": {
                                "Kind": "Everyday",
                                "Days": [
                                    "Sunday",
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday"
                                ],
                                "Time": "2020-02-04T22:00:00+13:00",
                                "TimeOffsetUtc": 13,
                                "Enabled": true
                            },
                            "OptionsMonthly": {
                                "Time": "2020-02-04T22:00:00+13:00",
                                "TimeOffsetUtc": 13,
                                "DayNumberInMonth": "Fourth",
                                "DayOfWeek": "Saturday",
                                "Months": [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December"
                                ],
                                "DayOfMonth": 1,
                                "Enabled": false
                            },
                            "OptionsPeriodically": {
                                "Kind": "Hours",
                                "FullPeriod": 1,
                                "Schedule": {
                                    "Days": [
                                        {
                                            "Name": "Sunday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Monday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Tuesday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Wednesday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Thursday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Friday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Saturday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        }
                                    ]
                                },
                                "Enabled": false
                            },
                            "OptionsContinuous": {
                                "Schedule": {
                                    "Days": [
                                        {
                                            "Name": "Sunday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Monday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Tuesday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Wednesday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Thursday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Friday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Saturday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        }
                                    ]
                                },
                                "Enabled": false
                            },
                            "OptionsBackupWindow": {
                                "TimePeriods": {
                                    "Days": [
                                        {
                                            "Name": "Sunday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Monday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Tuesday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Wednesday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Thursday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Friday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        },
                                        {
                                            "Name": "Saturday",
                                            "Value": "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
                                        }
                                    ]
                                },
                                "Enabled": false
                            },
                            "OptionsDaisyChaining": {
                                "PreviousJobUid": "",
                                "Enabled": false
                            }
                        },
                        "ImmediateCopyMode": null,
                        "Links": null,
                        "Href": null,
                        "Type": null
                    },
                    "Name": "Archived Projects",
                    "UID": "urn:veeam:NasJob:70073b98-098b-4046-a097-43cbda67d58a",
                    "Links": [
                        {
                            "Rel": "Up",
                            "Href": "https://localhost:9398/api/backupServers/7905ba33-78a5-4a34-9b3c-16bf216fdd68",
                            "Name": "appserver",
                            "Type": "BackupServerReference"
                        },
                        {
                            "Rel": "Alternate",
                            "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a",
                            "Name": "Archived Projects",
                            "Type": "JobReference"
                        },
                        {
                            "Rel": "Down",
                            "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/includes",
                            "Name": null,
                            "Type": "NasObjectList"
                        },
                        {
                            "Rel": "ToggleScheduleEnabled",
                            "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/toggleScheduleEnabled",
                            "Name": null,
                            "Type": null
                        },
                        {
                            "Rel": "Down",
                            "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/backupSessions",
                            "Name": null,
                            "Type": "BackupJobSessionReferenceList"
                        },
                        {
                            "Rel": "Start",
                            "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/start",
                            "Name": null,
                            "Type": null
                        },
                        {
                            "Rel": "Stop",
                            "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/stop",
                            "Name": null,
                            "Type": null
                        },
                        {
                            "Rel": "Retry",
                            "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a/retry",
                            "Name": null,
                            "Type": null
                        }
                    ],
                    "Href": "https://localhost:9398/api/nas/jobs/70073b98-098b-4046-a097-43cbda67d58a?format=Entity",
                    "Type": "NasJob"
                }
            ]
        }
        
        ```
        
        ## /api/nas/jobs/{id}?format=Entity
        
        **HTTP GET**
        
        This will return a single job but the same schema above in the full /api/nas/jobs?format=entity fetch
        
        The ID is the UID returned from the index without the urn:Veeam:NasJob: prefix
        
        > See above for the schema example
        
        
    
    

