---
title: 'Look ma, no restore points - investigating Veeam V12 Enterprise Manager API restore points not returning data' 
description: 'We have had a long standing self service recovery integration from a portal into
our Veeam Environment. With V12 now being rolled out everywhere I was'
heroImage: '/content/images/2023/11/Enterprise-Manager-API.jpg'
slug: 'investigating-veeam-v12-enterprise-manager-api-restore-points-not-returning-data'
pubDate: '2023-11-15T05:30:19.000Z'
tags: ["veeam", "api", "enterprise manager"] 
categories: ['veeam']
author: ["ben"]
---

We have had a long standing self service recovery integration from a portal into our Veeam Environment. With V12 now being rolled out everywhere I was performing some integration testing and noticed that our endpoint for restore points was returning nothing. 

General process the code follows

- We know the virtual machine we want to get endpoints for, this includes the name and importantly the ManagedObjectReference, aka MoRef from VMware
- We get the target Veeam server in the case Enterprise manager is connected to more than one BackupServer
- We look up the virtual centre in Veeam, to get the HierarcyRoot via /api/query?Type=HierarchyRoot
- We use the Enterprise Manager Query service /api/query?Type=VmRestorePoint to find the matching VmRestorePoints. The filter we use is a HierarchyObjRef, more on this in a minute.
- Use the restore point data to return to the UI but also enhance it with the HierarcyRoot name (for use in additional UI screens and restore point actions/integrations)

Time to dive in and diagnose what is going on.

### Hierarchy Root and Restore Point relationship

Essentially the Hierarchy Root this is the source of your virtual machine data, in our case a Virtual Centre. Each one of your sources will be defined as a Hierarchy Root.

When a restore point is taken and stored within Veeam this metadata is held against the HierarchyObjRef metadata. 

This is useful as if we know the virtual centre and the vm managed object reference, we can do a nice simple query to return all restore points for that virtual machine that Veeam has in its database via the Query service.

Example metadata on a VMRestorePoint from Enterprise Manager

```
<HierarchyObjRef>urn:VMware:Vm:b5a60ace-7623-407b-b008-777e956ee555.vm-31017</HierarchyObjRef>

```

This tells us

**b5a60ace-7623-407b-b008-777e956ee555 **is the HierarchyRoot Id - Veeam's record of our vSphere instance added into our inventory. 

**vm-31017** is the VMware mamaged object reference identifier of that virtual machine, you can get the same value via PowerCLI or similar talking directly to VMware

Then to return ALL restore points from enterprise manager, we can use the query service again with a query like the following
```
/api/query?format=entities&Filter=HierarchyObjRef=="urn:VMware:Vm:b5a60ace-7623-407b-b008-777e956ee555.vm-31017"&Type=VmRestorePoint

```

Our issue is.. our code doesn't return any restore points. Let's diagnose.

### Diagnosis

Querying the Hierarchy Roots we can see the ID being **27cfa99b-d35a-**..... well that doesnt match the b5a60ace-7623.... in the sample above.
![](/content/images/2023/11/image-7.png)
Querying the restore points with a simple VmName query to get all for this Virtual machine audi99 (the one with our MoRef of vm-31017) we can see what it returns
```
/api/query?format=entities&Type=VmRestorePoint&Filter=VmName=="audi99"

```

It returns a few, and looking the identifier, this confirms that **b5a60ace-7623...** is used here as well and not what we queried above on the hierarchy roots query expecting **27cfa99b**...
![](/content/images/2023/11/image-8.png)
So where is b5a60 coming from? or why is this not the id we expect in the hierarchy root query entity object? We only have a single vcentre attached and only a single hierarchy root is returned via the API so it's not a miss match.

Time to have a peep in the database to find out where it might be coming from.

If we do a search of all columns/tables in the database let's see if we can get to the bottom of it

**Veeam Database**

*Searching for**** "vcsa[redacted]"***
Of note, other than logs and other metadata type tables 

**PhysicalHosts** - has an ID of 7A0E2232... doesnt seem to be relevant
![](/content/images/2023/11/image-9.png)
**Hosts** - well there is our identifier in the restore point data. B5a60 in the id column thats a start.
![](/content/images/2023/11/image-10.png)
Scrolling through the other columsn in this table and what do we have under the unique_id column but our id **27cfa99b... **
![](/content/images/2023/11/image-15.png)
Ok, so, has the format of the HierarchyRootObj ref changed then and we need to adjust our code?

There is a [document for this](https://helpcenter.veeam.com/docs/backup/em_rest/constructing_hierarchyobjreftype.html?ver=120) and according to that the format is

**urn:<Platform>:<Type>:<HierarchyRootId>.<ObjectRef>**

And by definition

> "*HierarchyRootID* i**s an ID of the host **on which the virtual infrastructure object resides. The HierarchyRootID can be obtained using the [/hierarchyRoots](https://helpcenter.veeam.com/docs/backup/em_rest/hierarchyroots.html) resource."


Ok so thats correct let's plug in our gaps

- Platform: *VMware*
- Type: Vm
- HierarchyRootID: for vcsa[redacted] having ID 27cfa99b-d35a-41e4-936f-2804a0083074
- Mo-ref: vm-31017 for audi99 virtual machine, hosted on vcdsa[redacted]


That then gives us the following URN of
**urn:VMware:Vm:27cfa99b-d35a-41e4-936f-2804a0083074.vm-31017**

But if we query that then 0 results remember. And looking at the restore points they all have the format
**urn:VMware:Vm:b5a60ace-7623-407b-b008-777e956ee555.vm-31017**

So, something is going on here, it looks like the API has a bug? and is returning unique_id as the id for the HierarchyRoots query, that would certainly explain it, and a quick switch in the query from 27cf.. to b5a6... nets us the results we expect.

Time to log a support ticket!

### Update - after support ticket logged 

Investigations were correct, known bug which as of 16 November 2023 the resolution for it was to apply a hotfix which is provided by request.

Assume it will be rolled up into next major patch and release cycle but if you come across it before then log a support ticket and request "Fix_482670_49d411695f " 


