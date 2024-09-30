---
title: '"Quick tip: Defrag your Veeam Office365 Jet Database"' 
description: 'Over time the JET database that backs your repository in Veeam Backup for
Microsoft Office365 can become fragmented and cause unnecessary performance
'
heroImage: '/content/images/2020/09/defrag-operations-esentutl-1.png'
slug: 'quick-tip-defrag-your-veeam-office365-jet-database'
pubDate: '2020-09-23T05:15:41.000Z'
tags: ["office365", "vbo"] 
categories: ['veeam']
author: ["ben"]
---

Over time the JET database that backs your repository in Veeam Backup for Microsoft Office365 can become fragmented and cause unnecessary performance impacts for you and your users such as searching via the Veeam Explorers for Exchange / OneDrive / Sharepoint (and soon Teams!). Here is a quick tip for running a defrag operation. 

**A few things before you begin:**

- !!!! Don't just perform this unless you have are trying to resolve a potential performance issue and** I strongly advise you do so at the advice of Veeam Support before ruling out anything else environmental**. 
- If you have the capability/capacity it would be recommended to back this data with Veeam Backup and Replication using a Guest Processing/Application Aware enabled backup job so that should this process corrupt the repository you can perform a restore operation
- You will need some temporary space as this operation basically makes a copy of the current adb file and then replaces it, for example if your repository.adb file is 200GB, ideally you will have at least 210gb free on the existing drive or on another drive.
- This operation can take time and you will need to shut down the Veeam.Archiver.Proxy services on the repository server to release the file locks on the repository.adb files before you begin. So pick a time when it is not going to impact your normal backup window.

### Let's get started

Open up the proxy server where your repository is hosted.

**1)**  Shut down the **Veeam Backup Proxy for Microsoft Office 365 Service **via  services.msc
![](/content/images/2020/09/shutdown-veeam-archiver-service.png)
This will take a while, if you are interested open up performance manager and you will see the locks on all of the repository.adb files from this Veeam.Archiver.Proxy.exe service, these will start clearing out.

Now with the locks off the file you can begin to perform the defragmentation operations.

**2) **Open up a powershell window and run the following command

     esentutl /d "E:\Jetdefrag\repository.adb" /t "E:\Jetdefrag\tempdfg.edb"
    
    ```
    
    > Note the path, in Backup for Office365 a repository.adb file is created one per year (and more than one per year if your repositories are massive) so your path will be more like E:\YourRepository\2020 (2019, 2018 etc, one per year) so you will want to jump through and run this on all of them
    
    
    The /d flag is the target repository (that Veeam has been using already)
    
    You will also see the /t flag, **this is important**, by default without this flag/switch it will use your C:\ to write the new defragmented file to before copying it back so ensure you redirect this to a drive with free space (unless you have heaps of free space on the C:\).
    
    Now let it do it's thing, you will see the file specified with the /t switch start to fill up and the console window does have a nifty little progress bar. Once complete you will see the following
    ![](/content/images/2020/09/defrag-operations-esentutl.png)
    The temp file will then be moved in place of your existing repository.adb and you are now free to start the Veeam Archiver Service again, then run a job to confirm that the database is still in tact, or you can open up the latest backup point via the Veeam Backup for Office 365 Console and browse the data via the Explorers.
    

