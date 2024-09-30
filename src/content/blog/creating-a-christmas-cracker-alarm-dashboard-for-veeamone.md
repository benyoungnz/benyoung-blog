---
title: 'Creating a Christmas Cracker alarm dashboard for VeeamONE' 
description: 'VeeamONE allows you fire a script when alarms are triggered so given the time of
year for the last Veeam User Group of the year I have created a Chris'
heroImage: '/content/images/2021/11/Screen-Shot-2021-11-22-at-1.41.47-PM.png'
slug: 'creating-a-christmas-cracker-alarm-dashboard-for-veeamone'
pubDate: '2021-11-22T00:42:41.000Z'
tags: ["api", "veeamone", "powershell"] 
categories: ['veeam']
author: ["ben"]
---

VeeamONE allows you fire a script when alarms are triggered so given the time of year for the last Veeam User Group of the year I have created a Christmas themed dashboard and api to push alerts too and display them in real time.

When an alert is received the dashboard which is subscribed to a websocket has the alarm detail pushed down to it and in turn has the alarm formatted and injected onto the page.

> *Note *there is a new **experimental** VeeamONE API I will look to show and provide an alternate dashboard where we are pulling the alarms directly.

Here's an example of the dashboard running with one alarm having been pushed through.
![](/content/images/2021/11/Screen-Shot-2021-11-22-at-12.19.54-PM.png)
Ways you can use this yourself

1. Run the docker image I have already built
2. For the time limited, use my demo endpoint at [https://veeamonereceiver.benyoung.dev ](https://veeamonereceiver.benyoung.dev )
3. Clone the source code, modify if required and publish (built in aspnet core)

*There is a Get Started page that has links to the powershell script/alarm config, or a more detailed version is below.*

### 1. Run the docker image

This is the quickest way to have a play with the site in your own environment that has a docker instance, even on desktop.

The following command will pull the image from my repository, publish it in the background on port 5000.

```
docker run -d -p 5000:80 benyoung/veeamonereceiver
```

You can customise port 5000 to your requirements, the container is listening on 80 and 443. 

Your output should look similar too the following, if you are wondering what is going on you can always run **docker container ls **to view the running containers.
![](/content/images/2021/11/Screen-Shot-2021-11-22-at-12.18.19-PM.png)
### 2. Demo Environment

I have published a demo environment - note that anyone could be sending data to this and no attempt to sanitise data received from the API is in place so in theory someone could inject XSS code etc 

> [https://veeamonereceiver.benyoung.dev/](https://veeamonereceiver.benyoung.dev/)


### 3. Clone source, build yourself

The source is published on GitHub so if you are familiar with aspnet core or enough to be dangerous then go forth and do what you want with it.

> [https://github.com/benyoungnz/VeeamONEReceiver](https://github.com/benyoungnz/VeeamONEReceiver)


## Testing the dashboard

With your dashboard up and running (or using the shared environment) you can then test the dashboard using Postman, curl, powershell *(basically anything that that post some JSON to the api over http/s)*

The alarm API on our dashboard expects the following payload to be sent.
```json
{
"alarmName": "Guest Disk Space",
"objectName": "MYSERVER12",
"information": "This is some information regarding C:\\ it is nearly out of space.",
"triggeredOn": "18/11/2021 17:35:23",
"alarmState": "Error",
"alarmPreviousState": "Ok",
"alarmId": 132133
}
```

Load the dashboard up where you have published it, for the below I am using the local docker version on my Macbook on http://localhost:5000
![](/content/images/2021/11/Screen-Shot-2021-11-22-at-12.18.29-PM.png)
No alarms there as yet as nothing has been pushed. So, let's fire this across test payload - I am using Postman

> **POST*** to http://localhost:5000**/api/alarm ***
> Select raw payload then JSON as the type

![](/content/images/2021/11/Screen-Shot-2021-11-22-at-12.19.44-PM.png)
This should go through and if you view your dashboard there will be a cracker visible with the detail you sent via your payload.
![](/content/images/2021/11/Screen-Shot-2021-11-22-at-12.19.54-PM-1.png)
If you hover over the cracker, you'll reveal the message too.
![](/content/images/2021/11/Screen-Shot-2021-11-22-at-12.20.09-PM.png)
If you make the dashboard and postman (or terminal/script you are sending the payload from) visible at the same time, fire off the request and you'll note these just turn up automatically, newest items are injected at the top of the list.

## Hooking it up to VeeamONE

So assuming you have published this in a way that your VeeamONE server can get too it then you can wire this up to your desired alarms and put this on the big screen in the office and await for them to roll on in.

First up, grab the Powershell script from the gist, put this on your server where it can be executed.
![](/content/images/2021/11/Screen-Shot-2021-11-22-at-1.02.11-PM.png)
In VeeamONE under **Alarm Management**

Select your alarms (you can do multiple at once), then edit
![](/content/images/2021/11/image.png)
Click Add under notifications, select Run script as the action

Now, in the Value field is where you want to put the reference to your Powershell file along with the param values containing the alarm detail. For example;

powershell.exe "c:\alarmScripts\AlertTo-VeeamONEReceiver.ps1" '%1' '%2' '%3' '%4' '%5' '%6' %7

```
![](/content/images/2021/11/image-1.png)
Save the alarm, that's it. Now these alarms will send the detail through to your dashboard.

## Triggering a VeeamONE alarm

You can do this any way you want, given I applied my alarms to the connection state of the Veeam Backup server, i'll just simulate a connection failure by dropping the ethernet connection since it's a virtual machine.

Ill disconnect it in esxi, then wait for a few of the alarms to trigger, depending on the settings for each alarm this can take a few minutes before it will be triggered.
![](/content/images/2021/11/image-2.png)
*(a few minutes later)*

The dashboard begins to light up with Christmas joy!
![](/content/images/2021/11/image-3.png)
If we take a look in VeeamONE this matches what was sent through
![](/content/images/2021/11/image-4.png)
Connecting the backup server back to the network, it will then pull through the resolution notification too.
![](/content/images/2021/11/image-5.png)
That's it! customise as you require let me know your creations by tagging me on Twitter @benyoungnz 
            
        
        
    
    

