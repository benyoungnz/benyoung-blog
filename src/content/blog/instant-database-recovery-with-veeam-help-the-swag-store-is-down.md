---
title: 'Instant Database Recovery with Veeam - Help the SWAG store is down!' 
description: 'We all know how much our industry loves swag right? What happens when someone
accidentally deletes/corrupts/runs an unfavourable query on the producti'
heroImage: '/content/images/2021/08/website-down.png'
slug: 'instant-database-recovery-with-veeam-help-the-swag-store-is-down'
pubDate: '2021-08-27T03:20:20.000Z'
tags: ["instant recovery"] 
categories: ['veeam']
author: ["ben"]
---

We all know how much our industry loves swag right? What happens when someone accidentally deletes/corrupts/runs an unfavourable query on the production database? Lucky we were backing up the database server with Veeam Backup and Replication right...

Ok, so, this is not actually a real store but what I have put together is an interactive .NET web application pointing at a SQL (Express) database and we will run through a few different recovery methods but also some other pretty useful functions you can use the same feature with. 

### The Application aka "Veeam Swag Store"

As I mentioned this is a demo application I have put together with .NET Core. Given we want to test out the instant recovery functionality at the database layer naturally it is fully interactive with it's database and it provides the following;

- User authentication store
- Product listing data
- User purchases/pre-order commitments

![](/content/images/2021/08/image-1.png)
Once you login you can manage your own swag list, this data is all saved off to to the database.
![](/content/images/2021/08/image-3.png)
There is also a custom error page, if there is an "error" on the site we will see this - under this demo we of course will be pulling out the database from underneath the application.
![](/content/images/2021/08/image.png)
### Ooooops, someone deleted the database

In reality this could be many things from data corruption, unwanted schema changes and if you need to revert you can. I am keeping it simple and pretending an operator has simply deleted the entire database.
![](/content/images/2021/08/image-4.png)Not recommended in production!
Now if I refresh this application sure enough, its not happy.
![](/content/images/2021/08/image-5.png)
### Instant Recovery to the rescue

For our recovery scenario are going to perform an Instant recovery in which we **will not **copy all of the data back to the server instead Veeam will perform some magic and present the data out of the backups to get us up and running very quickly. 

Imagine you had a very large database, the instant recovery will take no more than a couple of minutes even in my small lab environment to spin up vs copying all the data to the server before it can be attached.

In Veeam Backup and Replication find your server (AppServer for me), Right click > Restore application Items > Restore SQL Server databases 
![](/content/images/2021/08/image-6.png)
Select the restore point or just use the latest like I am going to 
![](/content/images/2021/08/image-7.png)
The B&R console will now load up the Veeam Microsoft SQL Server explorer and you will get a view of all SQL instances/databases that is part of the backup restore point. You can see our **VeeamSwagStore** database under the SQL2012 instance.
![](/content/images/2021/08/image-8.png)
You will notice some of the options in the toolbar such as the various restore (database, schema) as well as performing an export to a sql backup such as bak or even spin out the mdf/ldf to directly attach. Pretty sweet.

We however want to check out this new Instant Recovery feature, you can also instant recovery to another server instance, loads of use cases here..... focus Ben.
![](/content/images/2021/08/image-9.png)
Hit the Instant Recovery latest state back to YOURSERVER\INSTANCEHERE

You are then presented with some switchover scheduling which defines when and how the database will switchover. Options below; 
![](/content/images/2021/08/image-10.png)
I like how you can even schedule it for out of hours or similar, i am going to run with **Manual** so we can see a few things while it runs. 

The Instant Recovery process will now run and in the browser you can see this by clicking on the menu item in the tree.

After a couple of minutes you can see in the explorer the status is now showing as Online and in this case because it is small everything has been copied and is ready for switchover, the database comes online before this.
![](/content/images/2021/08/image-13.png)
What happens if we refresh the web application now?
![](/content/images/2021/08/image-14.png)
Look at that, my swag is still there! 

Ok, what is happening in SQL? If I open up SQL Management Studio, right click the database and view the properties
![](/content/images/2021/08/image-15.png)
Look at that file path, and if you have followed along with my other Instant recovery posts it is located in our good mate **C:\VeeamFLR\**

Looking in that folder you can see the two database files in there
![](/content/images/2021/08/image-17.png)
What happens if I change something in the database? Is is read only given this data is coming out of the backup? Nope! Full read write without being destructive at all to your restore point.

I will remove the trucker cap from my swag list.
![](/content/images/2021/08/image-16.png)
Now, let's perform the switchover - remember this can be automatic (once it's copied the data and is ready) or can be schedule to a time of your liking. Or manual, like we are going to do here.

In the explorer, right click the instant recovery, click perform switchover
![](/content/images/2021/08/image-18.png)
Veeam will now start the switchover and move the files where they need to go and update references.
![](/content/images/2021/08/image-19.png)
Once complete the Instant Recovery will disappear from your list of active recoveries.

Now if we take a look at the database properties again, the file paths have been updated and we are fully back up in operational on that database server.
![](/content/images/2021/08/image-20.png)
The **C:\VeeamFLR\...** folder is also no longer present and has been cleaned up automatically.

Impressed? I know I was when i first did that recovery, how powerful!

