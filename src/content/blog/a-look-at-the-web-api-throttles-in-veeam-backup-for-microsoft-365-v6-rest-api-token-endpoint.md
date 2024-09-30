---
title: 'A look at the web api throttles in Veeam Backup for Microsoft 365 v6 REST API (Token endpoint)' 
description: 'Upgrading to VBO v6 here and testing it before we push to production,
immediately noticed that some of my integration tests were failing, which was
we'
heroImage: '/content/images/2022/04/you-shall-not-pass.jpg'
slug: 'a-look-at-the-web-api-throttles-in-veeam-backup-for-microsoft-365-v6-rest-api-token-endpoint'
pubDate: '2022-04-13T01:25:05.000Z'
tags: ["api", "office365"] 
categories: ['veeam']
author: ["ben"]
---

Upgrading to VBO v6 here and testing it before we push to production, immediately noticed that some of my integration tests were failing, which was weird as some were working and it was always the /token login endpoint

Taking a look with Fiddler Proxy in the middle we can see the following;
![](/content/images/2022/04/image-8.png)
HTTP 429 Quota Exceeded on the /token endpoint, well that's new for v6! My guess is Veeam have decided to implement some protections on the API with the release of the the Self Service Restore portal which must consume this API. This is also on the Token endpoint so great practice from Veeam here to prevent mass brute force attempts to access an account. 

I fired off a few in succession via postman to demonstrate the issue, green were success and red ones where the failed (throttled ones)
![](/content/images/2022/04/image-18.png)
If i manually get a session then hammer a different endpoint other than the /token endpoint with this session everything goes this OK with no limits.
![](/content/images/2022/04/image-16.png)
So that's good. The main issue is on our multi tenant portal I push this API relatively hard and when there are lots of simultaneous users to the portal it will likely exceed more than this current threshold with my current design of my code (session per customer task).

 My "design" actually dates back to some original code with B&R Enterprise Manager when it would only return some data for one particular session (mainly long running restore tasks) and i decided for security this was actually pretty handy so split out customers to their own session which helped keep our API secure, obviously I have other checks and balances in place but this was an additional protection mechanism.

So I need to sort this by changing how my application works around session management and sharing potentially between these customer tasks, which is fine as its the same backend user context anyway but it will mean a relatively big change which will delay getting v6 upgraded in production. 

Naturally I a curious and i wonder if I can temporarily increase this to allow for the current design to work and thus allow for v6 to be pushed into production. I don't have an issue with this as a temporary solution as we do not publicly publish this API and it is no different from the current risk profile on the v5 release.

 Let's (try) take a look to see what's going on under the hood.

Looking under the general options where you enable/disable the Restful API did not yield a magic "limit to X per second" box
![](/content/images/2022/04/image-9.png)
Let's check out the install folder where the API is launched from, typically, C:\Program Files\Veeam\Backup365

Looking in here we see a new DLL library, this is probably it eh!
![](/content/images/2022/04/image-10.png)
If we load the config file for this website, there are no default values in here... bummer.
![](/content/images/2022/04/image-11.png)
Time to dig a little deeper. A google search of WebAPIThrottle.dll yields up a Nuget package with a public git repository, seems to be a fairly popular (although not recently updated project)  [https://github.com/stefanprodan/WebApiThrottle](https://github.com/stefanprodan/WebApiThrottle)

This could be it - looking at the properties of the DLL confirms this, the Copyright matches the name of the repository owner.
![](/content/images/2022/04/image-12.png)
Ok, so where is this set then?

The documentation for the WebAPIThrottle project indicates you can set this at startup of the project, baked into the code (i hope not!), or you can have values in a configuration file and inject these at startup time (let's hope so). But with no values on the config file, we need to work out where these are coming from.

Looking at the Veeam documentation under "rest configuration" it really is just around the ports/certificates to use, essentially on that window we see under general options.

Although, there is a new Veeam.Archiver.Rest.Configurator.exe application [documented ](https://helpcenter.veeam.com/docs/vbo365/guide/vbo_configuring_rest_separate.html?ver=60) which lets us spin up and change the base settings for the API and change the hostname if you wanted to have the restore portal on a different computer. Perhaps there is also a magic throttle box in here? Let's load it up from the install folder
![](/content/images/2022/04/image-13.png)
Nope. Pretty much the same as options with the addition of controller host box. Nothing to see here.

Right, where to next? Veeam traditionally configure a lot of settings in the registry although typically for VBR. Let's do a find for "throttle" to see if we can find anything that looks like it.

A few hits but nothing obvious. Let's leave this for now until we exhaust a few other options then come back for a more exhaustive search with more terms.

Also nothing under the HKLM > Veeam VBO node other than license.
![](/content/images/2022/04/image-14.png)
Moving on. time to take a peek at some of the code to see what is going on here at Startup in the .NET app.

If I take a look at the code, there is a Veeam.REST.Sever.Server.Throttling section with a path of */Veeam/Archiver/Options/Rest/Throttling*

It also references a global config helper, which appears to take a path+perhaps a default value at the end. I can see under EndpointTokensPerSecond there is a default value of 1. Other values were 5 per minute and 1500 per hour. 

> Insider tip: Word on the street is, the throttle is applied only to non-localhost (127.0.0.1) addresses, so effectively you will only run into this if your calling the api from outside the localhost... which will more than often be the case + its recommended to split the new restore portal off to a new machine

Interesting to note here is that there is a "GlobalPerSecond" etc so if you wanted looks like you can throttle everything, the default is a longmax, which is.. wwaaaay more than this server could handle.

This lines up with what we were seeing and does highlight why I will change my own code to allow for sessions to be shared more between tenants.

Now time to take some guesses about how to implement this config values based on what we have discovered.

Attempt 1, the config file for the hosted web service for the REST API
![](/content/images/2022/04/image-19.png)
Failed to start service, which i figured. You typically need a "ConfigSections" declaration saying that there is one for Veeam which this file didnt have. Worth a shot.

Ok, now from previous experience, Veeam actually has a Config.exe under C:\ProgramData\Veeam\Backup365

Let's open this up, bingo.
![](/content/images/2022/04/image-21.png)
Now we are onto something.... i think. This aligns completely with the pathing i saw in the code.

Lets add the new values to the Rest node, note this needs to be a child property so you need to remove the / from the end of the current <Rest line and then add a closing </Rest> below it - then in between add the new <Throttling values.... /> section like below
![](/content/images/2022/04/image-23.png)
Restart the service to pick up the new values, then blast the API, see what happens. Look at that, it works! Before/After
![](/content/images/2022/04/image-22.png)
Cool.

Right so, off to optimise my code to share sessions and use token refreshes a little better globally but this will allow us to move through to production now and i can follow up with a release. 

I wouldn't recommend using this long term, ideally optimise your own code but if you need it in a pinch this is a good way of doing it. Handy to also know there is some configurable global limits too, might be useful to set some generous limits here but to again prevent brute force / ddos style attacks which may cause backend problems. 

