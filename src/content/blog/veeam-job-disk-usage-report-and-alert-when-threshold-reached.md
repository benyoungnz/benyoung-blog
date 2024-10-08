---
title: 'Veeam Job Disk Usage Report and Alert when threshold reached' 
description: 'Need to monitor Veeam jobs and their disk usage? There are a few reasons why you
may need this - for me I wanted to have alert when a job was over a c'
heroImage: '/content/images/2022/03/veeam-backup-size-threshold.jpg'
slug: 'veeam-job-disk-usage-report-and-alert-when-threshold-reached'
pubDate: '2022-03-28T22:46:54.000Z'
tags: ["powershell"] 
categories: ['veeam']
author: ["ben"]
---

Need to monitor Veeam jobs and their disk usage? There are a few reasons why you may need this - for me I wanted to have alert when a job was over a certain total disk size so I could start splitting them out into smaller jobs. 

You may have a different reason but here is a simple script you can use to run every day (or whenever) that will send you a nice report IF any jobs are over your configured threshold, otherwise it wont send anything. also.... we haven't had a PowerShell Tuesday for a while.

### Example report 

*From my lab (set to 100gb), note my backup server is cleverly named "BackupServer" your actual server will end up here*
![](/content/images/2022/03/image-8.png)
### The script

```powershell
#alert at or over this amount
$alertOverGB = 100;

#your email settings
$emailSettings = @{
    To         = 'youremail@example.com'
    From       = 'backupserver@example.com'
    Smtpserver = 'yourmailserver.com'
    Subject    = "{{VBRServer}} jobs over $($alertOverGB)GB"
}


$vbrAllJobSizes = Get-VBRBackup | Select @{N="Job";E={$_.Name}}, @{N="Usage";E={[math]::Round(($_.GetAllStorages().Stats.BackupSize | Measure-Object -Sum).Sum/1GB,1)}}

$vbrJobsInAlert = $vbrAllJobSizes | where {$_.Usage -gt $alertOverGB} | Sort-Object -Property Usage -Descending



# if results over threshold, send email
if ($vbrJobsInAlert.count -ne 0) {

$emailTemplate = @"
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <style>
@media only screen and (max-width: 620px) {
  table.body h1 {
    font-size: 28px !important;
    margin-bottom: 10px !important;
  }

  table.body p,
table.body ul,
table.body ol,
table.body td,
table.body span,
table.body a {
    font-size: 16px !important;
  }

  table.body .wrapper,
table.body .article {
    padding: 10px !important;
  }

  table.body .content {
    padding: 0 !important;
  }

  table.body .container {
    padding: 0 !important;
    width: 100% !important;
  }

  table.body .main {
    border-left-width: 0 !important;
    border-radius: 0 !important;
    border-right-width: 0 !important;
  }

}
@media all {

  .apple-link a {
    color: inherit !important;
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    text-decoration: none !important;
  }

  #MessageViewBody a {
    color: inherit;
    text-decoration: none;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
  }

}
</style>
  </head>
  <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">{{VBRServer}} jobs have been processed, some are over threshold of {{Threshold}}GB.</span>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">

            <!-- container -->
            <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">

              <!-- main-->
              <tr>
                <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><h2>{{Title}}</h2></p>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Backup jobs have been processed, below are the jobs that meet your threshold of {{Threshold}}GB.</p>
                        
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                <table role="presentation" border="0" cellpadding="10" cellspacing="10" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                <thead>
                                <tr><th cellpadding="10" style="text-align: left;" align="left">Job</th>
                                <th cellpadding="10" style="text-align: left;" align="left">Size</th></tr>
                                <thead>
                                  <tbody>
                                        {{DataRows}}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Over to you!</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- end main -->
            </table>
            <!-- end container -->

            <!-- footer -->
            <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                <tr>
                  <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Generated {{GeneratedOn}} for {{VBRServer}}</span>
                 
                  </td>
                </tr>
              </table>
            </div>
            <!-- end footer -->

          </div>
        </td>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
"@

$rowTemplate = @"
<tr>
<td cellpadding="10" style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top" align="left" width="75%">{{JobName}}</td>
<td cellpadding="10" style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top" align="left" width="25%">{{JobUsage}}GB</td>
</tr>
"@


$alertRows = ""

foreach ($jobAlerts in $vbrJobsInAlert)
{
    $row = $rowTemplate

    $row = $row.Replace("{{JobName}}", $jobAlerts.Job)
    $row = $row.Replace("{{JobUsage}}", $jobAlerts.Usage)

    $alertRows += $row
}

#put server details in 
$vbrSession = Get-VBRServerSession

#show server detail in subject
$emailSettings.Subject = $emailSettings.Subject.Replace("{{VBRServer}}", $vbrSession.Server)

#replace vars from template with data

$emailTemplate = $emailTemplate.Replace("{{Title}}", $emailSettings.Subject)
$emailTemplate = $emailTemplate.Replace("{{Threshold}}", $alertOverGB)
$emailTemplate = $emailTemplate.Replace("{{GeneratedOn}}", $(Get-Date -Format "dd/MM/yyyy HH:mm"))
$emailTemplate = $emailTemplate.Replace("{{DataRows}}", $alertRows)
$emailTemplate = $emailTemplate.Replace("{{VBRServer}}", $vbrSession.Server)

# send email
Send-MailMessage @emailSettings -Body $emailTemplate -BodyAsHtml
}
```
Out of the box all you really is to edit the top 10 lines of the script

- $alertThresholdGB = the GB amount if a job reaches you want to alert on, below this will be ignored
- $emailSettings = where and how you want the email routed, note that the subject has a token {{VBRServer}} which will get replaced with the name of the VBR session this report is for, handy if you want to run this from multiple backup servers

### How is the storage measured

So line 14 is pretty much where it all happens. First we;

1. Trigger **Get-VBRBackup** to get all backup jobs, you could filter here if you like or enter a single backup job if you only want to monitor one job
2. For each of the jobs we then use the **GetAllStorages()** function and sum all of the data into a custom object alongside the job name 

That's all there is to it. Enjoy! 

