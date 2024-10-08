---
title: '10 cool things you do with the Veeam ONE API' 
description: 'Anyone that has used Veeam ONE will know it loves consuming data from not only Veeam products but also your hypervisors and related infrastructure. 
heroImage: '/content/images/2022/06/VEEAMONE-API-usage.jpg'
slug: '8-cool-things-you-do-with-the-veeam-one-api'
pubDate: '2022-06-28T01:57:32.000Z'
tags: ["veeamone", "api"] 
categories: ['veeam']
author: ["ben"]
---

Anyone that has used Veeam ONE will know it loves consuming data from not only Veeam products but also your hypervisors and related infrastructure. That data can be then beautifully presented in business views, reports etc. 

I am more and API and data guy so let's take a look at that side of things eh?

## Alarms

This really is the heart of the platform. Being able to alert (and remediate in some cases) on issues with connected infrastructure is very powerful. 

The product comes with a [HEAP of pre-defined](https://helpcenter.veeam.com/docs/one/alarms/appendix.html?ver=110) alarms for Veeam and Virtual Infrastructure platforms such as VMware vSphere and Hyper-v

Better yet.. you can [create your own alarms](https://helpcenter.veeam.com/docs/one/alarms/create_alarms.html?ver=110) and have this link back to internal documentation / kb / wiki about remediation information etc.

### #1 Getting triggered alarms

> GET to [https://veeamone:1239/api/v2/alarms/triggered](https://veeamone:1239/api/v2/alarms/triggered)

```json
{
  "items": [
    {
      "triggeredAlarmId": 1,
      "name": "Orphaned VM backup snapshot",
      "alarmTemplateId": 271,
      "triggeredTime": "2021-08-23T10:29:11.013Z",
      "status": "Error",
      "description": "Orphaned Veeam Backup & Replication snapshot has been detected. Age (3 weeks) is older than a defined threshold (1 hour)",
      "repeatCount": 1,
      "alarmAssignment": {
        "objectId": 70,
        "objectName": "srv4",
        "objectType": "VSphereVm"
      },
      "childAlarmsCount": 0
    },
    {
      "triggeredAlarmId": 2,
      "name": "Orphaned VM backup snapshot",
      "alarmTemplateId": 271,
      "triggeredTime": "2021-08-23T10:29:11.013Z",
      "status": "Error",
      "description": "Orphaned Veeam Backup & Replication snapshot has been detected. Age (3 weeks) is older than a defined threshold (1 hour)",
      "repeatCount": 1,
      "alarmAssignment": {
        "objectId": 71,
        "objectName": "srv6",
        "objectType": "VSphereVm"
      },
      "childAlarmsCount": 0
    },
    {
      "triggeredAlarmId": 340,
      "name": "Bad vCenter Server username logon attempt",
      "alarmTemplateId": 18,
      "triggeredTime": "2021-08-23T10:38:23.877Z",
      "status": "Error",
      "description": "Fired by event: BadUsernameSessionEvent\n Event description: Cannot login vsphere.local\\LimitedScope@172.24.150.244\n Initiated by: vsphere.local\\LimitedScope",
      "repeatCount": 1,
      "alarmAssignment": {
        "objectId": 72,
        "objectName": "srv8",
        "objectType": "VSphereVCenter"
      },
      "childAlarmsCount": 0
    },
    {
      "triggeredAlarmId": 3,
      "name": "Host hardware status",
      "alarmTemplateId": 109,
      "triggeredTime": "2021-08-23T10:29:31.69Z",
      "status": "Error",
      "description": "Host hardware status for other subsystem has changed to Alert level",
      "repeatCount": 1,
      "alarmAssignment": {
        "objectId": 163,
        "objectName": "srv9",
        "objectType": "VSphereHost"
      },
      "childAlarmsCount": 0
    }
  ],
  "totalCount": 4
}

```

This is rich with information, such as giving you links/identifiers to related objects (helpful for auto remediation scripts!) but also when it was triggered, how many times this alarm has repeated.

### #2 Getting more information about the alarm

Now if you want more information about the alarm you can then run a query to the below and find the template with the alarmTemplateId == the alarmTemplateId in the above triggered alarm payload.

GET to [https://veeamone:1239/api/v2/alarms/templates](https://veeamone:1239/api/v2/alarms/templates)

```json
{
  "items": [
    {
      "alarmTemplateId": 114,
      "name": "Topology collection failure",
      "type": "Internal",
      "knowledgeSummary": "Veeam ONE Monitoring Server failed to collect infrastructure topology",
      "knowledgeCause": "Virtual Server might not be accessible",
      "knowledgeResolution": "Make sure Virtual Server is accessible",
      "knowledgeCustom": null,
      "knowledgeExternal": "See a corresponding event description for more information",
      "isEnabled": true,
      "isPredefined": true,
      "assignments": [
        {
          "objectId": 0,
          "objectName": "Virtual Infrastructure",
          "objectType": "VirtualInfrastructure"
        },
        {
          "objectId": 3,
          "objectName": "vCloud Infrastructure",
          "objectType": "CloudDirectorInfrastructure"
        },
        {
          "objectId": 2,
          "objectName": "Backup Infrastructure",
          "objectType": "VbrInfrastructure"
        }
      ],
      "exclusions": []
    },
    {
      "alarmTemplateId": 115,
      "name": "Performance data collection failure",
      "type": "Internal",
      "knowledgeSummary": "Veeam ONE Monitoring Server failed to collect performance data from the objects specified",
      "knowledgeCause": "There might be multiple reasons for this:Virtual Server might not be accessibleVirtual Server is under heavy load",
      "knowledgeResolution": "Verify that Virtual Server is availableMake sure firewall on Virtual Server allows incoming connectionsCheck account permissions used to connect to Virtual Server specifiedUse native tools to test connection to specified server",
      "knowledgeCustom": null,
      "knowledgeExternal": "See a corresponding event description for more information",
      "isEnabled": true,
      "isPredefined": true,
      "assignments": [
        {
          "objectId": 0,
          "objectName": "Virtual Infrastructure",
          "objectType": "VirtualInfrastructure"
        },
        {
          "objectId": 3,
          "objectName": "vCloud Infrastructure",
          "objectType": "CloudDirectorInfrastructure"
        },
        {
          "objectId": 2,
          "objectName": "Backup Infrastructure",
          "objectType": "VbrInfrastructure"
        }
      ],
      "exclusions": []
    }

  ],
  "totalCount": 4
}

```

Now you get a rich display of the alarm. I really like the knowledge* nodes, you can populate this with your OWN data and information that is relevant to your business.

## Public Cloud

As we move more and more to a hybrid world being able to centrally manage and monitor backups on premise, the edge and the cloud becomes very important. 

### #3 Public cloud backup policy

Easy check what policies you have and what is enabled or disabled.

GET to [https://veeamone:1239/api/v2/publicCloud/backupPolicies](https://veeamone:1239/api/v2/publicCloud/backupPolicies)

```json
{
  "items": [
    {
      "policyUid": "a52fab23-58b3-4ab8-b53a-0365ee371e48",
      "name": "VPC Configuration Backup",
      "state": "Disabled",
      "backupServerId": 1253,
      "platform": "AWS",
      "vmCount": 0,
      "lastSnapshotDate": null,
      "lastBackupDate": "2021-08-31T10:32:08Z",
      "lastReplicationDate": null
    },
    {
      "policyUid": "58369734-1dae-438c-8405-113ebadbc465",
      "name": "AgPolicy",
      "state": "Enabled",
      "backupServerId": 1253,
      "platform": "AWS",
      "vmCount": 1,
      "lastSnapshotDate": "2021-09-01T15:01:29Z",
      "lastBackupDate": "2021-09-01T15:05:03Z",
      "lastReplicationDate": null
    },
    {
      "policyUid": "8fc50894-9681-43f4-b08d-4897b63ba6ae",
      "name": "EFS reg ",
      "state": "Enabled",
      "backupServerId": 1253,
      "platform": "AWS",
      "vmCount": 1,
      "lastSnapshotDate": "2021-08-31T12:18:04Z",
      "lastBackupDate": null,
      "lastReplicationDate": "2021-08-31T12:39:17Z"
    },
    {
      "policyUid": "1ef3df9f-f41c-4145-8db6-3c7d3b670550",
      "name": "RDS reg",
      "state": "Enabled",
      "backupServerId": 1253,
      "platform": "AWS",
      "vmCount": 1,
      "lastSnapshotDate": "2021-08-31T07:09:24Z",
      "lastBackupDate": null,
      "lastReplicationDate": null
    }
  ],
  "totalCount": 4
}

```

You can see the list of policies, when the last backup or snapshot was, what instance and what cloud the policy was run from. 

### #4 Public cloud protected VM 

Take a glance now into the policies, you can extract information out about what virtual machines are protected with what backup instance.

GET to [https://veeamone:1239/api/v2/publicCloud/cloudVms](https://veeamone:1239/api/v2/publicCloud/cloudVms)

```json
{
  "items": [
    {
      "resourceId": "i-0d90c5cf2698b0e09",
      "name": "SERVER1",
      "backupServerId": 1363,
      "platform": "AWS",
      "backupPolicyUids": []
    },
    {
      "resourceId": "i-047b86495a7bc7992",
      "name": "SERVER2",
      "backupServerId": 1363,
      "platform": "AWS",
      "backupPolicyUids": []
    },
    {
      "resourceId": "i-0b9172fda818be4b7",
      "name": "SERVER3",
      "backupServerId": 1363,
      "platform": "AWS",
      "backupPolicyUids": []
    },
    {
      "resourceId": "i-02308d97e62398c51",
      "name": "SERVER4",
      "backupServerId": 1363,
      "platform": "AWS",
      "backupPolicyUids": []
    }
  ],
  "totalCount": 4
}

```

## vSphere Monitoring & Querying

Being able to query and monitor your hypervisor centrally is pretty special. This could save you having to talk to multiple systems over different languages to get the same information.

### #5 Virtual Machines

Anyone who has used PowerCLI before knows you can quickly get a pretty unruly bunch of code to get some of the information out of the vSphere platform. Veeam ONE has all this in a nice top level object for you to do what you need!

Everything from guest disk data, specification, state, mo-ref identifiers and guest information

And of course they close the loop with the Veeam side showing you backup and replica data.

GET to [https://veeamone:1239/api/v2/vSphere/vms](https://veeamone:1239/api/v2/vSphere/vms)

```json
{
  "items": [
    {
      "vmId": 482,
      "moRef": "vm-46",
      "parentId": 264,
      "parentType": "ResourcePool",
      "name": "AlphaVC",
      "powerState": "PoweredOn",
      "cpuCount": 4,
      "guestDnsName": "vc1.tech.local",
      "memorySizeMb": 16384,
      "guestDisks": [
        {
          "name": "/",
          "capacityBytes": 11355283456,
          "freeSpaceBytes": 3902181376
        },
        {
          "name": "/boot",
          "capacityBytes": 125783040,
          "freeSpaceBytes": 80774144
        },
        {
          "name": "/storage/dblog",
          "capacityBytes": 15710797824,
          "freeSpaceBytes": 14715600896
        },
        {
          "name": "/storage/netdump",
          "capacityBytes": 1031823360,
          "freeSpaceBytes": 960466944
        },
        {
          "name": "/storage/seat",
          "capacityBytes": 26279735296,
          "freeSpaceBytes": 22008918016
        },
        {
          "name": "/storage/log",
          "capacityBytes": 10426310656,
          "freeSpaceBytes": 4941279232
        },
        {
          "name": "/storage/deploy",
          "capacityBytes": 10426310656,
          "freeSpaceBytes": 9849495552
        },
        {
          "name": "/storage/db",
          "capacityBytes": 10426310656,
          "freeSpaceBytes": 9410641920
        },
        {
          "name": "/storage/updatemgr",
          "capacityBytes": 105546809344,
          "freeSpaceBytes": 100042420224
        },
        {
          "name": "/storage/imagebuilder",
          "capacityBytes": 10426310656,
          "freeSpaceBytes": 9849491456
        },
        {
          "name": "/storage/archive",
          "capacityBytes": 52702081024,
          "freeSpaceBytes": 14557184
        },
        {
          "name": "/storage/core",
          "capacityBytes": 52702081024,
          "freeSpaceBytes": 49821351936
        }
      ],
      "guestIpAddresses": [
        "172.24.147.110"
      ],
      "guestOs": "VMware Photon OS (64-bit)",
      "isReplica": false,
      "virtualDisks": [
        {
          "name": "Hard disk 1",
          "capacityBytes": 12884901888
        },
        {
          "name": "Hard disk 2",
          "capacityBytes": 1812987904
        },
        {
          "name": "Hard disk 3",
          "capacityBytes": 26843545600
        },
        {
          "name": "Hard disk 4",
          "capacityBytes": 53687091200
        },
        {
          "name": "Hard disk 5",
          "capacityBytes": 10737418240
        },
        {
          "name": "Hard disk 6",
          "capacityBytes": 10737418240
        },
        {
          "name": "Hard disk 7",
          "capacityBytes": 16106127360
        },
        {
          "name": "Hard disk 8",
          "capacityBytes": 26843545600
        },
        {
          "name": "Hard disk 9",
          "capacityBytes": 1073741824
        },
        {
          "name": "Hard disk 10",
          "capacityBytes": 10737418240
        },
        {
          "name": "Hard disk 11",
          "capacityBytes": 10737418240
        },
        {
          "name": "Hard disk 12",
          "capacityBytes": 107374182400
        },
        {
          "name": "Hard disk 13",
          "capacityBytes": 53687091200
        }
      ],
      "connectionState": "Connected",
      "notes": "VMware vCenter Server Appliance",
      "totalDiskCapacityBytes": 343262887936,
      "virtualDiskCount": 13,
      "datastoreUsage": [
        {
          "datastoreMoRef": "datastore-44",
          "commitedBytes": 158197871247,
          "uncommitedBytes": 234471046222,
          "unsharedBytes": 123738259456
        }
      ],
      "isCdpReplica": false,
      "virtualHardwareVersion": "vmx-10",
      "lastProtectedDate": null,
      "vmProtectionJobUids": [],
      "businessViewGroupIds": [
        711,
        722,
        731
      ]
    },
    {
      "vmId": 457,
      "moRef": "vm-3667",
      "parentId": 243,
      "parentType": "ResourcePool",
      "name": "vcdnsx-ctrl01.tech.local-NSX-controller-1",
      "powerState": "PoweredOn",
      "cpuCount": 4,
      "guestDnsName": "nsx-controller",
      "memorySizeMb": 4096,
      "guestDisks": [
        {
          "name": "/",
          "capacityBytes": 4093313024,
          "freeSpaceBytes": 2013986816
        },
        {
          "name": "/boot",
          "capacityBytes": 1023303680,
          "freeSpaceBytes": 909950976
        },
        {
          "name": "/var/cloudnet/data",
          "capacityBytes": 4093313024,
          "freeSpaceBytes": 3687014400
        },
        {
          "name": "/image",
          "capacityBytes": 5150212096,
          "freeSpaceBytes": 4854517760
        },
        {
          "name": "/config",
          "capacityBytes": 2046640128,
          "freeSpaceBytes": 1919324160
        },
        {
          "name": "/os_bak",
          "capacityBytes": 4093313024,
          "freeSpaceBytes": 3853410304
        },
        {
          "name": "/var/log",
          "capacityBytes": 5150212096,
          "freeSpaceBytes": 1872805888
        }
      ],
      "guestIpAddresses": [
        "172.24.177.38"
      ],
      "guestOs": "VMware Photon OS (64-bit)",
      "isReplica": false,
      "virtualDisks": [
        {
          "name": "Hard disk 1",
          "capacityBytes": 30064771072
        }
      ],
      "connectionState": "Connected",
      "notes": "",
      "totalDiskCapacityBytes": 30064771072,
      "virtualDiskCount": 1,
      "datastoreUsage": [
        {
          "datastoreMoRef": "datastore-3499",
          "commitedBytes": 30155165888,
          "uncommitedBytes": 532,
          "unsharedBytes": 30064771072
        }
      ],
      "isCdpReplica": false,
      "virtualHardwareVersion": "vmx-11",
      "lastProtectedDate": null,
      "vmProtectionJobUids": [],
      "businessViewGroupIds": [
        711,
        721,
        729
      ]
    },
    {
      "vmId": 565,
      "moRef": "vm-966",
      "parentId": 238,
      "parentType": "ResourcePool",
      "name": "FalconStor-VTLVA",
      "powerState": "PoweredOn",
      "cpuCount": 2,
      "guestDnsName": null,
      "memorySizeMb": 8624,
      "guestDisks": [],
      "guestIpAddresses": [],
      "guestOs": "Red Hat Enterprise Linux 5 (64-bit)",
      "isReplica": false,
      "virtualDisks": [
        {
          "name": "Hard disk 1",
          "capacityBytes": 26843545600
        },
        {
          "name": "Hard disk 2",
          "capacityBytes": 6815744000
        },
        {
          "name": "Hard disk 3",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 4",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 5",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 6",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 7",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 8",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 9",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 10",
          "capacityBytes": 262144000000
        },
        {
          "name": "Hard disk 11",
          "capacityBytes": 42949672960
        }
      ],
      "connectionState": "Connected",
      "notes": "FalconStor VTL Virtual Appliance v7.50 build 7375 for VMware ESX/ESXi 4.0 and ESX/ESXi 4.1\nhttp://www.falconstor.com",
      "totalDiskCapacityBytes": 2173760962560,
      "virtualDiskCount": 11,
      "datastoreUsage": [
        {
          "datastoreMoRef": "datastore-96",
          "commitedBytes": 2173847682793,
          "uncommitedBytes": 5635,
          "unsharedBytes": 2173760962560
        }
      ],
      "isCdpReplica": false,
      "virtualHardwareVersion": "vmx-07",
      "lastProtectedDate": null,
      "vmProtectionJobUids": [],
      "businessViewGroupIds": [
        711,
        717,
        729
      ]
    },
    {
      "vmId": 467,
      "moRef": "vm-407",
      "parentId": 284,
      "parentType": "ResourcePool",
      "name": "lrsHVcl1",
      "powerState": "PoweredOn",
      "cpuCount": 4,
      "guestDnsName": "lrshvcl1.tech.local",
      "memorySizeMb": 16384,
      "guestDisks": [
        {
          "name": "C:\\",
          "capacityBytes": 63829962752,
          "freeSpaceBytes": 40113467392
        },
        {
          "name": "E:\\",
          "capacityBytes": 107237863424,
          "freeSpaceBytes": 50249269248
        },
        {
          "name": "F:\\",
          "capacityBytes": 107237863424,
          "freeSpaceBytes": 107121610752
        }
      ],
      "guestIpAddresses": [
        "172.24.150.170",
        "fe80::a590:61d1:27cf:435",
        "172.24.150.172",
        "fd00:ac19:0:1890:0:2d51:fca4:4450",
        "fe80::ac7f:a5e5:bd12:ca0c",
        "fd00:ac19:0:1890:0:d753:b792:c1db"
      ],
      "guestOs": "Microsoft Windows Server 2016 or later (64-bit)",
      "isReplica": false,
      "virtualDisks": [
        {
          "name": "Hard disk 1",
          "capacityBytes": 64424509440
        },
        {
          "name": "Hard disk 2",
          "capacityBytes": 107374182400
        },
        {
          "name": "Hard disk 3",
          "capacityBytes": 107374182400
        }
      ],
      "connectionState": "Connected",
      "notes": "",
      "totalDiskCapacityBytes": 279172874240,
      "virtualDiskCount": 3,
      "datastoreUsage": [
        {
          "datastoreMoRef": "datastore-39",
          "commitedBytes": 134351419415,
          "uncommitedBytes": 256247862588,
          "unsharedBytes": 65497202688
        }
      ],
      "isCdpReplica": false,
      "virtualHardwareVersion": "vmx-14",
      "lastProtectedDate": null,
      "vmProtectionJobUids": [],
      "businessViewGroupIds": [
        711,
        725,
        731
      ]
    }
  ],
  "totalCount": 4
}

```

### #6 Datastores

You can get a heap of information out of this and cover of most use cases from monitoring or capacity planning to helping with a disk or vm placement (free space) as a couple of examples

GET to [https://web01:1239/api/v2/vSphere/datastores](https://web01:1239/api/v2/vSphere/datastores)

```json
{
  "items": [
    {
      "datastoreId": 56,
      "moRef": "datastore-244",
      "parentId": 58,
      "parentType": "DatastoreFolder",
      "name": "datastore1",
      "type": "Vmfs",
      "connectionState": "Connected",
      "path": "ds:///vmfs/volumes/5ddd5dce-03835cc0-0934-005056b8b84f/",
      "capacityBytes": 77846282240,
      "freeSpaceBytes": 76815532032,
      "vmCount": 1,
      "hostCount": 1,
      "businessViewGroupIds": [
        703
      ]
    },
    {
      "datastoreId": 57,
      "moRef": "datastore-247",
      "parentId": 58,
      "parentType": "DatastoreFolder",
      "name": "datastore2",
      "type": "Vmfs",
      "connectionState": "Connected",
      "path": "ds:///vmfs/volumes/5fabd5a1-817a0c62-b858-005056beb73c/",
      "capacityBytes": 77846282240,
      "freeSpaceBytes": 76826017792,
      "vmCount": 1,
      "hostCount": 1,
      "businessViewGroupIds": [
        703
      ]
    },
    {
      "datastoreId": 87,
      "moRef": "datastore-3486",
      "parentId": 104,
      "parentType": "DatastoreFolder",
      "name": "datastore3",
      "type": "Vmfs",
      "connectionState": "Connected",
      "path": "ds:///vmfs/volumes/607f7f2e-6ad81252-2aac-ac1f6beddd04/",
      "capacityBytes": 48005923209216,
      "freeSpaceBytes": 47940083122176,
      "vmCount": 7,
      "hostCount": 1,
      "businessViewGroupIds": [
        703
      ]
    },
    {
      "datastoreId": 88,
      "moRef": "datastore-3487",
      "parentId": 104,
      "parentType": "DatastoreFolder",
      "name": "datastore4",
      "type": "Vmfs",
      "connectionState": "Connected",
      "path": "ds:///vmfs/volumes/607f7f63-bb51d2e8-5c83-ac1f6beddd04/",
      "capacityBytes": 3839969198080,
      "freeSpaceBytes": 3576756699136,
      "vmCount": 4,
      "hostCount": 1,
      "businessViewGroupIds": [
        703
      ]
    }
  ],
  "totalCount": 4
}

```

### #7 Connected ESXi Hosts

More powerful information here, quickly report on host health, versions, specification and maintenance mode status among others!

GET to [https://veeamone:1239/api/v2/vSphere/hosts](https://veeamone:1239/api/v2/vSphere/hosts)

```json
{
  "items": [
    {
      "hostId": 63,
      "moRef": "host-243",
      "name": "172.24.149.3",
      "parentId": 54,
      "parentType": "HostCluster",
      "port": null,
      "connectionState": "Connected",
      "powerState": "PoweredOn",
      "vendor": "VMware, Inc.",
      "model": "VMware Virtual Platform",
      "socketCount": 2,
      "cpuPackageCount": 2,
      "cpuCoreCount": 2,
      "cpuModel": "Intel(R) Xeon(R) Silver 4214R CPU @ 2.40GHz",
      "cpuMhz": 2400,
      "memorySizeBytes": 4294365184,
      "nicCount": 1,
      "isMaintenanceModeEnabled": false,
      "memoryUsageMb": 1452,
      "cpuUsageMhz": 39,
      "isVmotionEnabled": false,
      "connectionAccount": null,
      "connectionError": null,
      "version": "6.5.0",
      "businessViewGroupIds": []
    },
    {
      "hostId": 64,
      "moRef": "host-246",
      "name": "172.24.149.58",
      "parentId": 53,
      "parentType": "HostCluster",
      "port": null,
      "connectionState": "Connected",
      "powerState": "PoweredOn",
      "vendor": "VMware, Inc.",
      "model": "VMware Virtual Platform",
      "socketCount": 2,
      "cpuPackageCount": 2,
      "cpuCoreCount": 2,
      "cpuModel": "Intel(R) Xeon(R) Silver 4214R CPU @ 2.40GHz",
      "cpuMhz": 2400,
      "memorySizeBytes": 4290170880,
      "nicCount": 1,
      "isMaintenanceModeEnabled": false,
      "memoryUsageMb": 1499,
      "cpuUsageMhz": 41,
      "isVmotionEnabled": false,
      "connectionAccount": null,
      "connectionError": null,
      "version": "6.5.0",
      "businessViewGroupIds": []
    },
    {
      "hostId": 163,
      "moRef": "host-31",
      "name": "srv7.tech.local",
      "parentId": 83,
      "parentType": "HostCluster",
      "port": null,
      "connectionState": "Connected",
      "powerState": "PoweredOn",
      "vendor": "Supermicro",
      "model": "Super Server",
      "socketCount": 2,
      "cpuPackageCount": 2,
      "cpuCoreCount": 24,
      "cpuModel": "Intel(R) Xeon(R) Silver 4214 CPU @ 2.20GHz",
      "cpuMhz": 2200,
      "memorySizeBytes": 410873970688,
      "nicCount": 2,
      "isMaintenanceModeEnabled": false,
      "memoryUsageMb": 153251,
      "cpuUsageMhz": 9850,
      "isVmotionEnabled": true,
      "connectionAccount": null,
      "connectionError": null,
      "version": "6.7.0",
      "businessViewGroupIds": []
    },
    {
      "hostId": 164,
      "moRef": "host-34",
      "name": "srv9.tech.local",
      "parentId": 83,
      "parentType": "HostCluster",
      "port": null,
      "connectionState": "Connected",
      "powerState": "PoweredOn",
      "vendor": "Supermicro",
      "model": "Super Server",
      "socketCount": 2,
      "cpuPackageCount": 2,
      "cpuCoreCount": 24,
      "cpuModel": "Intel(R) Xeon(R) Silver 4214 CPU @ 2.20GHz",
      "cpuMhz": 2200,
      "memorySizeBytes": 410873970688,
      "nicCount": 2,
      "isMaintenanceModeEnabled": false,
      "memoryUsageMb": 361752,
      "cpuUsageMhz": 11946,
      "isVmotionEnabled": true,
      "connectionAccount": null,
      "connectionError": null,
      "version": "6.7.0",
      "businessViewGroupIds": []
    }
  ],
  "totalCount": 4
}

```

### #8 Host Hardware Sensors

As these bubble up from the underlying host hardware - you too can get access to this information. Sometimes this data can be hard to extract out of the various hardware vendors platforms so this is useful!

GET to [https://veeamone:1239/api/v2/vSphere/hostSensors](https://veeamone:1239/api/v2/vSphere/hostSensors)

```json
{
  "items": [
    {
      "hostId": 163,
      "name": "Memory 0",
      "type": "Memory",
      "state": "Healthy",
      "details": ""
    },
    {
      "hostId": 163,
      "name": "Memory 1",
      "type": "Memory",
      "state": "Healthy",
      "details": ""
    },
    {
      "hostId": 163,
      "name": "Memory 10",
      "type": "Memory",
      "state": "Healthy",
      "details": ""
    },
    {
      "hostId": 163,
      "name": "Memory 16",
      "type": "Memory",
      "state": "Healthy",
      "details": ""
    }
  ],
  "totalCount": 4
}

``
```

## Reporting on license usage

You may need this for a variety of reasons, tracking usage? end of month reporting? renewals?

Veeam ONE has sprinkles of license information in a couple of locations

### #9 Attached hypervisors/backed up virtual machines

> GET to [https://veeamone:1239/api/v2/license/usageReport](https://veeamone:1239/api/v2/license/usageReport)

```json
{
  "reportId": 0,
  "removalReason": "",
  "workloads": [
    {
      "workloadType": "Virtual Machines",
      "usedObjects": 376,
      "newObjects": 2,
      "usedUnits": 376,
      "newUnits": 2,
      "multiplier": 1,
      "removedObjects": 0,
      "removedUnits": 0
    }
  ],
  "date": "2021-09-16T09:07:30.513Z",
  "status": "Draft",
  "approvalDate": "2021-09-16T09:07:30.513Z",
  "totalWorkloads": 164
}
```

Some nice data in there, not only the totals but also new units/objects.

### #10 Cloud Connect license and quota usage (service provider only)

For service providers using service provider console you can get this data from here, or if you elected not to use console back in the day and still have a but of a hybrid environment this might be a nice way of collecting the data.

> GET to [https://veeamone:1239/api/v2/cloudConnect/tenantQuotas](https://veeamone:1239/api/v2/cloudConnect/tenantQuotas)

```json
{
  "items": [
    {
      "tenantQuotaId": 0,
      "tenantQuotaUidInVbr": "bb2b05b5-5a9c-4e2a-81ba-28e8823ed13a",
      "tenantId": 0,
      "backupServerId": 0,
      "quotaMb": 0,
      "usedQuotaMb": 0,
      "protectedVmsCount": 0,
      "lastBackupActivityTime": "2019-08-24T14:15:22Z",
      "serversCount": 0,
      "workstationsCount": 0
    }
  ],
  "totalCount": 0
}
```

You will see there this endpoints would return an array of tenants and for each of them it has the quota information (used/free) but also the protectedVms and workstations count for licensing accounting.

