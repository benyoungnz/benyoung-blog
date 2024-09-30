---
title: 'Perform first-class disk restore using Veeam VBR API' 
description: 'Lets take a look at the new restore endpoints in the Veeam Backup and
Replication API - For clarity, I am not  talking about the Enterprise Manager
A'
heroImage: '/content/images/2021/12/first-class-disk-recovery-veeam.jpg'
slug: 'perform-first-class-disk-restore-using-veeam-vbr-api'
pubDate: '2021-12-09T01:25:57.000Z'
tags: ["automation", "api", "veeam", "vbr"] 
categories: ['veeam']
author: ["ben"]
---

Let's take a look at the new restore endpoints in the Veeam Backup and Replication API - For clarity, I **am not** talking about the Enterprise Manager API but the new  api attached directly to your VBR install - This is future of automating VBR and I could not be more excited about having this decouple from Enterprise Manager. 

So, what is a first class disk? Essentially its bunch of capabilities that VMware have opened up in the vSphere API allowing for vendors (or you..) to create block devices independently of a virtual machine. 

Veeam have hooked into this allowing for you to restore individual disks from a restore point, they create a new datastore over their vPower NFS magic and make this disk available for consumption. 

High level steps we need to take programatically to make this work 

- Perform the FCD restore using the Veeam B&R API 
- Find the attached/restored file via the vSphere API (vStorageObjectManager)
- Reconfigure our target VM to attach the restored VMDK file sitting mounted from Veeam

### Perform FCD restore 

I will show you the endpoints and payloads you need to hit here, I have developed this in C# (dotnet core) but once you can see the endpoints/payloads you can translate this to any language.

I will also assume by this point you [can login to the API](https://helpcenter.veeam.com/docs/backup/vbr_rest/reference/vbr-rest-v1-rev2.html?ver=110#tag/Login) and have an access key to set on the Authorization header, as well as [adding the "x-api-version" header](https://helpcenter.veeam.com/docs/backup/vbr_rest/versioning.html?ver=110) to each request. 

**Step 1. Get your target cluster**
We need the cluster detail, so you need a target host (vcenter) to query. 

To do this let's see what is attached to our Backup server
**GET to /api/v1/inventory/vmware/hosts**

    {
        "data": [
            {
                "inventoryObject": {
                    "type": "vCenterServer",
                    "hostName": "vcsa.testdev",
                    "name": "vcsa.testdev",
                    "objectId": ""
                },
                "size": "N/A"
            }
        ],
        "pagination": {
            "total": 1,
            "count": 1,
            "skip": 0,
            "limit": 200
        }
    }
    
    ```
    
    You can see I only have one here, **vcsa.testdev,** we need this "name" property in a minute so copy it or remember.
    
    Now, we need to use the inventory service to query the host for the cluster.
    **GET to /api/v1/inventory/vmware/hosts/vcsa.testdev?typeFilter=Cluster**
    
    > *Note my **typeFilter**, this is pretty handy you can filter the objects like VirtualMachine etc using this as well as other query parameters like name, page size etc, [check the docs.](https://helpcenter.veeam.com/docs/backup/vbr_rest/reference/vbr-rest-v1-rev2.html?ver=110#tag/Inventory-Browser)*
    
    
    This will return you the available clusters
    
        {
            "data": [
                {
                    "inventoryObject": {
                        "type": "Cluster",
                        "hostName": "vcsa.testdev",
                        "name": "CHC3-Cluster1",
                        "objectId": "domain-c1006"
                    },
                    "size": "N/A"
                }
            ],
            "pagination": {
                "total": 1,
                "count": 1,
                "skip": 0,
                "limit": 200
            }
        }
        
        ```
        
        The bit we are interested in is the "inventoryObject" so save this entire node out, you'll see where that goes in a minute in the restore step.
        
        **Step 2. Finding the restore point/disk(s) to restore**
        Let's hit up the objectRestorePoint endpoints so we can get the restore point we want to use. My demo is easy as there is only a single restore point but here goes.
        
        We will use our query parameters here to get them for the virtual machine called *"CatBiscuits"*
        
        **GET to /api/v1/objectrestorepoints?nameFilter=Catbiscuits**
        
            {
                "data": [
                    {
                        "platformName": "VMware",
                        "id": "8e91bac2-354a-4346-a6bc-d22c90734953",
                        "name": "Catbiscuits",
                        "platformId": "00000000-0000-0000-0000-000000000000",
                        "creationTime": "2021-12-09T07:52:32.98+13:00",
                        "backupId": "d8d1df85-e07d-4428-902c-1cdb035f4a88",
                        "allowedOperations": []
                    }
                ],
                "pagination": {
                    "total": 1,
                    "count": 1,
                    "skip": 0,
                    "limit": 200
                }
            }
            
            ```
            
            The bit we want here is the id property, *8e91bac2-354a-4346-a6bc-d22c90734953*
            
            So, copy this id, then we want to get a list of available disks for this restore point.
            
            **GET to /api/v1/objectrestorepoints/8e91bac2-354a-4346-a6bc-d22c90734953/disks**
            
                {
                    "data": [
                        {
                            "type": "Vi",
                            "state": "Processed",
                            "uid": "ea5fad06-cbd0-43f7-a880-c277ccc9a286:d30a3e2f-9a86-489d-bc0f-28d4fcdc8415:2000:8e91bac2-354a-4346-a6bc-d22c90734953",
                            "name": "Catbiscuits_3",
                            "capacity": 42949672960
                        },
                        {
                            "type": "Vi",
                            "state": "Processed",
                            "uid": "ea5fad06-cbd0-43f7-a880-c277ccc9a286:d30a3e2f-9a86-489d-bc0f-28d4fcdc8415:2001:8e91bac2-354a-4346-a6bc-d22c90734953",
                            "name": "Catbiscuits_5",
                            "capacity": 5368709120
                        }
                    ],
                    "pagination": {
                        "total": 2,
                        "count": 2,
                        "skip": 0,
                        "limit": 2
                    }
                }
                
                ```
                
                Choose the disk you want to restore, we want the Catbiscuits_5 disk, this name is important so save this aside for the next step.
                
                **Step 3. Perform the restore of the disk**
                Ok, by now you should have your Cluster information as well as the disk name from the restore point as well as the restore point identifier.
                
                Constructing your FCD restore payload looks like the following.
                
                    {
                      "objectRestorePointId": "8e91bac2-354a-4346-a6bc-d22c90734953",
                      "destinationCluster": {
                        "type": "Cluster",
                        "hostName": "vcsa.testdev",
                        "name": "CHC3-Cluster1",
                        "objectId": "domain-c1006"
                      },
                      "disksMapping": [
                        {
                          "nameInBackup": "Catbiscuits_5",
                          "mountedDiskName": "Catbiscuits_5_findme",
                          "registeredFcdName": "Catbiscuits_5_findme"
                        }
                      ],
                      "writeCache": {
                        "redirectIsEnabled": false
                      }
                    }
                    
                    ```
                    
                    Let's break it down a little;
                    
                    - **objectRestorePointId** should be self explanatory, it was what you copied in step 2 and used in the /api/v1/objectrestorepoints/{id}/disks endpoint to get available disks
                    - **destinationCluster **is the cluster detail you should have been able to copy directly from step 1, just insert the children from inventoryObject into the destinationCluster as above
                    - **diskMapping** are the disks we want to map, for this restore I am only doing a single disk but this is an array so you could do as many as you need from this restore point. **nameInBackup** is important and this needs to **match the name from step 2**. mountedDiskName and registeredFcdName you can enter what you need such as restore session identifiers or other, i just put findMe at the end for fun.
                    - **writeCache**, for the purposes of this not required but you can make your own assessment on this if you plan on using the disk once mounted. You can view the options [on the docs](https://helpcenter.veeam.com/docs/backup/vbr_rest/reference/vbr-rest-v1-rev2.html?ver=110#operation/InstantRecoveryVmwareFcdMountWithSession) and would just be a matter of adding the config in - there is an example there. 
                    
                    
                    Once you have your payload we will then set the content type to application/json and 
                    **POST to /api/v1/restore/instantRecovery/vmware/fcd/**
                    
                    You will have a payload returned, and you can then monitor running FCD restore points using  a
                    
                    This is an example of what you will receive, we want some of these values for when we start talking to vSphere to find where the vmdk is located.
                    
                        {
                            "data": [
                                {
                                    "state": "Mounted",
                                    "id": "577ecaa9-ff70-4e72-b530-4002e1bc8ae7",
                                    "sessionId": "577ecaa9-ff70-4e72-b530-4002e1bc8ae7",
                                    "spec": {
                                        "objectRestorePointId": "8e91bac2-354a-4346-a6bc-d22c90734953",
                                        "destinationCluster": {
                                            "type": "Cluster",
                                            "hostName": "vcsa.testdev",
                                            "name": "CHC3-Cluster1",
                                            "objectId": "domain-c1006"
                                        },
                                        "disksMapping": [
                                            {
                                                "nameInBackup": "Catbiscuits_5",
                                                "mountedDiskName": "Catbiscuits_5_findme",
                                                "registeredFcdName": "Catbiscuits_5_findme"
                                            }
                                        ],
                                        "writeCache": {
                                            "redirectIsEnabled": false,
                                            "cacheDatastore": null,
                                            "storagePolicy": null
                                        }
                                    },
                                    "errorMessage": null,
                                    "mountedDisks": [
                                        {
                                            "nameInBackup": "Catbiscuits_5",
                                            "mountedDiskName": "Catbiscuits_5_findme",
                                            "registeredFcdName": "Catbiscuits_5_findme",
                                            "objectId": "6fdede54-1216-41ea-82da-4330b84e2869"
                                        }
                                    ]
                                }
                            ],
                            "pagination": {
                                "total": 1,
                                "count": 1,
                                "skip": 0,
                                "limit": 1
                            }
                        }
                        
                        ```
                        
                        The identifier(s) we need is under the mountedDisks section, we need the **objectId** in our case 6fdede54-1216-41ea-82da-4330b84e2869 
                        
                        You will also see in the B&R UI you have an instant recovery running.
                        ![](/content/images/2021/12/image.png)
                        ### Attaching the running FCD restore to a VM
                        
                        If we take a look in vSphere we will now see a new Datastore attached and our disk has been restored into a folder.
                        ![](/content/images/2021/12/image-1.png)
                        The datastore seems to be VeeamBackup_{your backup server name} but I will likely look for this first when i get some production code running and if i find it use it, otherwise ill iterate each of the data stores and perform the find on the file there - would be nice if the VBR api returned the file path in the format vSphere likes it when you ask for the running FCD session information. 
                        
                        So, you could do these next steps a number of ways either via PowerCLI or via the vSphere API directly or via the SDKs made available for things like c#, python, java etc. 
                        
                        I will be using the vSphere SDK for c# but ill show you some rough code and you will need to tidy it up and handle errors etc appropriately. 
                        
                        **1. Find the VMDK via the ID**
                        As mentioned, you could *assume *the datastore name, which i will do here but ill add the logic in later to go find it elsewhere should the assumption fall over.
                        
                            
                            //assumes you have set dataStoreName and diskId (from Veeam VBR API) 
                            
                            //set the datstore ref
                            var datastoreRef = new Datastore(datastoreName, viClient);
                            
                            //get the vCenterStorageObjectManager client
                            var storageObjectManager = new VcenterVStorageObjectManager(viClient, viClient.ServiceContent.VStorageObjectManager);
                            
                            //get all disks in this datastore where the id matches out ID from Veeam
                              var disks = vom.ListVStorageObject(dataStore.ds.MoRef).Where(z => z.Id == diskId);
                            
                            if (!disks.Any())
                                return null; //or blow up.
                                
                            //get the detailed information about the disk
                            var veeamFCDDisk = vom.RetrieveVStorageObject(disks.First(), dataStore.ds.MoRef);
                            
                            return veeamFCDDisk;
                            
                            
                            ```
                            
                            so, what does the veeamFCDDisk look like when returned from the vSphere sdk?
                            ![](/content/images/2021/12/image-2.png)
                            Assuming it found the disk with the id then the property we are most interested here is the **filePath** which is in the format [DatastoreName] folder/filename.vmdk so you'll need to return this/get it later on when we reconfigure the VM.
                            
                            **2. Attaching the VMDK to the target virtual machine **
                            Now you can find the disk by the id and you can access the file path its just a matter of performing a ReconfigureVM task.
                            
                                //assumes you have found your VM and you have a VirtualMachine object, "vm" below
                                
                                //also assumes you have found your SCSI controller and have collected it's VirtualDevice.key value. ckey below.
                                
                                //also assumes you have found a free Unit number by iterating over all virtual devices already attached to the SCSI controller, overwriting it would be a bad idea... unitNumber below.
                                
                                //set connection info
                                var connectable = new VirtualDeviceConnectInfo();
                                connectable.StartConnected = true;
                                connectable.AllowGuestControl = false;
                                connectable.Connected = true;
                                
                                
                                //create a new virtual disk
                                VirtualDisk disk = new VirtualDisk();
                                
                                
                                //create a new backing for the virtual disk
                                VirtualDiskFlatVer2BackingInfo diskfileBacking = new VirtualDiskFlatVer2BackingInfo();
                                 
                                 
                                //storageObject was returned from the code above where we find the disk, youll need to potentially cast this to the BaseConfigInfoDiskFileBackingInfo type to access all the properties.
                                
                                var foundVMDK = (VMware.Vim.BaseConfigInfoDiskFileBackingInfo)storageObject.Config.Backing;
                                
                                diskfileBacking.DiskMode = "persistent";
                                diskfileBacking.FileName = foundVMDK.FilePath; //this is the path from the found file in format [DataStore] folder/filename.vmdk
                                
                                disk.Key = -1;
                                disk.ControllerKey = ckey; //youll need to get this scsi controller number
                                disk.UnitNumber = unitNumber; //this is a "free" unit number for the controller
                                disk.Backing = diskfileBacking;
                                disk.Connectable = connectable;
                                
                                
                                //disk device config, adding it then reference the disk from above.
                                VirtualDeviceConfigSpec diskSpec = new VirtualDeviceConfigSpec();
                                diskSpec.Operation = VirtualDeviceConfigSpecOperation.add;
                                diskSpec.Device = disk;
                                
                                //array of changes
                                VirtualDeviceConfigSpec[] diskSpecArray = { diskSpec };
                                VirtualMachineConfigSpec vmConfigSpec = new VirtualMachineConfigSpec();
                                vmConfigSpec.DeviceChange = diskSpecArray;
                                
                                
                                //reconfig the VM with the array of changes.
                                vm.ReconfigVM(vmConfigSpec);
                                
                                
                                
                                ```
                                
                                Assuming that all worked, if you now look at the VirtualMachine in the vSphere client our VM now has the FCD attached. 
                                ![](/content/images/2021/12/image-3.png)
                                There you go! How cool is this functionality, it opens up a world of possibilities for service providers and enterprise around self service / automated restoration... or a bunch of other use cases if you think about it.
                                
                            
                            
                        
                        
                    
                    
                
                
            
            
        
        
    
    

