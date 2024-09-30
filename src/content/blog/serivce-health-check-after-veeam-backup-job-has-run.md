---
title: 'Service check and restart after Veeam Backup job has run (post-thaw)' 
description: 'I came across an set of application servers in an environment which were not
fault tolerant at all to service disruption at all. Most often caused aro'
heroImage: '/content/images/2019/02/thaw.jpg'
slug: 'serivce-health-check-after-veeam-backup-job-has-run'
pubDate: '2019-02-26T21:05:34.000Z'
categories: ['veeam']
author: ["ben"]
---

I came across an set of application servers in an environment which were not fault tolerant at all to service disruption at all. Most often caused around the time the virtual machine was backed up, in particular when the snapshot was taken or committed as part of this VM backup which is pretty common. 

This post is about the script I put together to check server health which is triggered by Veeam Backup and Replication Server on the post-thaw event. More on that *at the bottom of the page*. 

### What does the script do?

Firstly, its a Powershell script.

1. Takes an array list of service names to monitor
2. Loops through and checks the status of each of them and performs an appropriate action
3. Logs results and status to a Slack channel so the application team can monitor easily

### Scenarios tested with each service

1. If **state == STOPPED**, starts the service, throws warning to log if unable to start
2. If **state == RUNNING**, leaves everything as-is, logs result
3. If **state is not STOPPED or RUNNING** then logs warning to be checked out as its likely in a bad state *(stuck in stopping or starting)*, needs a human to check it out
4. If service not found then it logs this as a warning stating the service was not found on the system

### Config

I have defined a config section at the top allowing for it to easily be adapted. One is for Slack if you want to use that and the other for the services you wish to monitor.

#### Slack

- $slackBotName = the name of the bot posting to Slack
- $slackKey = you slack generated webhook id
- $slackChannel = which channel you want to have the both post to

#### Services

- $servicesToMonitor = string array of service display names
- $servicesTimeout = default amount of time you want the desired service state

### The Script

```powershell
#---------------------------------[Slack Setup]---------------------------------
#bot name to post into slack
$slackBotName = "YourSlackBotName"
#your slack  webhook key - blank for no trigger
$slackKey = "YOURSLACKWEBHOOK"
#slack channel to post into
$slackChannel = "#YourChannel"

#---------------------------------[Services Setup]---------------------------------
$servicesToMonitor = "Xbox Live Auth Manager", "Windows Search", "MyServiceNotInstalled"
#what should the service start timeout be?
$servicesTimeout = "00:00:30" ##30 seconds by default


#---------------------------------[Functions]---------------------------------
function waitUntilServices($service, $status)
{
    # Wait for the service to reach the $status or until timeout
    $service.WaitForStatus($status, $servicesTimeout)
}

function logToSlack($message)
{
    #setup payload - customise as needed.
    #https://api.slack.com/incoming-webhooks
	$slackPayload = @{
	"channel" = $slackChannel
	"icon_emoji" = ":world_map:"
	"text" = "[{0}] {2} - {1}" -f $env:COMPUTERNAME, $message, $(Get-Date -Format T)
	"username" = $slackBotName
	}

	#slack enabled? If so, fire it off!
	if ($slackKey)
	{
		#send message to slack always.
		Invoke-WebRequest `
		-Body (ConvertTo-Json -Compress -InputObject $slackPayload) `
		-Method Post `
		-Uri "https://hooks.slack.com/services/$slackKey" | Out-Null
	}
  
}

#---------------------------------[Process]---------------------------------
#iterate each of the services
foreach ($s in $servicesToMonitor)
{
    
    #check if service exists.
    if(Get-Service -DisplayName $s -ea 0){

        #fetch service
        $svc = Get-Service -DisplayName $s
        Write-Host "Processing " $svc.DisplayName 


        if ($svc.Status -eq "Stopped")
        {
            logToSlack ("{0} service was stopped, we will start" -f $s)
            
            #start it.
            try 
            {
                $svc.Start()
                waitUntilServices $svc "Running"
            }
            catch { #catch it...
                logToSlack ("ERROR - {0} could NOT BE STARTED and needs to be investigated" -f $s) 
            }

        }
        elseif ($svc.Status -eq "Running") #service already running
        {
           logToSlack ("{0} service was running, leaving it be" -f $s)

        }
        else #service was not running or stopped, maybe "starting" or "stopping" etc.. needs to be looked at by a human. 
        {
           logToSlack ("WARNING - {0} was not Stopped OR Running, needs to be investigated" -f $s)

        }
    }
    else #service could not be found on system
    {
         Write-Host "Could not find " $s

        logToSlack ("WARNING - {0} service was not found on this system" -f $s)
    }

}
```

## Veeam Integration

Now you have the script you can configure it on your backup job under the application settings.

Upload the script to a location on your B&R server, something like c:\Scripts\ApplicationAwareProcessing

Follow the [steps here from Veeam](https://helpcenter.veeam.com/docs/backup/vsphere/vm_copy_vss_scripts.html?ver=95u4)  (remember to put your script on the B&R Server)

Now when you run the job you will see in the log it running the post-thaw event and the output come across to your slack channel

```
[CHCSQL] 12:08:35 PM - Xbox Live Auth Manager service was stopped, we will start
[CHCSQL] 12:08:36 PM - Windows Search service was stopped, we will start
[CHCSQL] 12:08:37 PM - ERROR - Windows Search could NOT BE STARTED and needs to be investigated
[CHCSQL] 12:08:37 PM - WARNING - MyServiceNotInstalled service was not found on this system

```

