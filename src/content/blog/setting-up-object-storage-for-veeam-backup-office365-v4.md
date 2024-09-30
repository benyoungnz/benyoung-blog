---
title: 'Setting up Object Storage Repository for Veeam Backup for Office365 v4'
description: 'With support now baked into v4 to backup Office365 data into object storage providers will be looking at migrating their block-backed repositories. Here is a quick run down of how to add one. '
heroImage: '/content/images/2020/01/vbo-s3-storage-offload-header.png'
slug: 'setting-up-object-storage-for-veeam-backup-office365-v4'
pubDate: '2020-01-09T00:34:39.000Z'
tags: ["vbo", "objectstorage"] 
categories: ['veeam']
author: ["ben"]
---

With support now baked into v4 to backup Office365 data into object storage a lot of service providers or enterprises will be looking at migrating their block-backed repositories. Here is a quick run down of how to add one. A  comparison at the end of what you see locally vs a traditional local repository on disk consumption and files wise.

## Setting up an object store target

You can of course consume any of the various offerings from Amazon, Azure, Wasabi etc but for this test I will be pushing this to a local object storage built on Minio.

I have ahead of time added a bucket called localrepo1-migration which is now ready to have VBO connected.

## Add an object storage target endpoint

You need to go to Backup Infrastructure > Object Storage Repositories, right click and click Add Object Storage

![vbo-add-object-repository](/content/images/2019/11/vbo-add-object-repository.png)

Now give it a name and click next - you can then select your target provider. I am going with S3 Compatible as it is local but you select what is appropriate for you.

![vbo-object-storage-step1](/content/images/2019/11/vbo-object-storage-step1.png)

Now enter your endpoint details, setup some cloud credentials and use that to connect to your desired object store.

![add-s3-compatible-endpoint-vbo-veeam](/content/images/2019/11/add-s3-compatible-endpoint-vbo-veeam.png)

You will now be asked to select your bucket, in our case it is the localrepo1-migration i had already created on the minio server

Then desired folder which you can create in your bucket using VBO by hitting Browse

![add-target-folder-object-storage](/content/images/2019/11/add-target-folder-object-storage.png)

Finalise the wizard with your bucket and folder selected

![complete-object-storage-wizard](/content/images/2019/11/complete-object-storage-wizard.png)

Your object repository is now added and can be used by adding a backup repository and offloading to this.

![local-object-repository-added](/content/images/2019/11/local-object-repository-added.png)

## Add a repository using new target

Now you have added your object repository you can add a new "local" repository that your jobs can target. This time though you will be offloading during the setup process to the newly created s3 repository.

Give the new backup repository a name, then select a local location for some local files (veeam magic) to sit, good to keep these in a named folder.

![Specify-local-path-for-repository](/content/images/2020/01/Specify-local-path-for-repository.png)

Now specify the desired retention, mine are only small test jobs so you configure what you require.

![configure-desired-retention-backu-job](/content/images/2020/01/configure-desired-retention-backu-job.png)

Now, the magic bit. Offloading - Select the Offload backup data to object storage, then you will be able to select your object storage repostiory endpoint. For me this is the localrepo1-migration. You can if you like (recommended) encrypt this at the same time by selecting this option as well. Ensure you take good care of your encryption passcode.

![configure-object-storage-offloading-vbov4](/content/images/2020/01/configure-object-storage-offloading-vbov4.png)

Click through the rest of the wizard and then you are good to go, you now have a repository ready for targetting backup jobs too.

![newly-added-offloaded-repository](/content/images/2020/01/newly-added-offloaded-repository.png)

> Note that you can just add a job using the normal process, your offloaded repository will just show up as a target.

## Comparison of Local vs Offloaded

Here is a view of the same backup data (same single user mailbox, same retention settings)

### Disk View

Here is a view of the traditional local based repository, one folder per year. Using 2.51gb

![disk-view-local-repository-vbo](/content/images/2020/01/disk-view-local-repository-vbo.png)

And here is what you see with the new offloaded repository, just a persistent cache folder totalling around 58mb.

![disk-view-of-persistent-cache-vbo-offload](/content/images/2020/01/disk-view-of-persistent-cache-vbo-offload.png)

### Offloaded Repository View

Up on the bucket side we see there is now data!

![minio-bucket-view](/content/images/2020/01/minio-bucket-view.png)

Pretty neat. This will open up a lot more possibilities and make it a lot easier to scale this product.

