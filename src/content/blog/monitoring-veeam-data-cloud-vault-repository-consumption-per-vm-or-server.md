---
title: "Monitor Per-VM Veeam Data Cloud Vault Consumption"
description: 'Generate an automated report to see per-object consumption in your Veeam Data Cloud Vault repository.'
heroImage: '/content/images/2025/per-vm-veeam-consumption-monitor-script.jpg'
slug: 'monitor-per-vm-veeam-data-cloud-vault-consumption'
pubDate: "2025-09-15T03:13:25.841Z"
tags: ["veeam", "powershell"] 
categories: ['veeam']
author: ["ben"]
---

Understanding exactly what's consuming space in your backup repositories is crucial for capacity planning and cost management. Veeam offers powerful observability tools like Veeam ONE, which can generate detailed, custom reports to provide this insight. For those who prefer to automate specific tasks or pull data directly, Veeam's extensibility via its PowerShell cmdlets provides another excellent option. This post focuses on that PowerShell approach, providing a script that generates a clean, per-object HTML report to help you see exactly what's consuming your Veeam Data Cloud Vault subscription.

## Key Features of this Script

  * **Pure HTML and CSS:** The report requires no JavaScript, making it lightweight, secure, and universally compatible in any browser.
  * **Extensible Code:** The PowerShell script is formatted to be easily extensible. You can add more properties to the report as you need to.


## What the Report Shows

The generated HTML file is broken into two clear sections:

1.  **VM Storage Summary:** A top-level table showing each VM/server, its backup job, the total number of restore points, and the calculated total size of its entire backup chain. This immediately highlights your biggest space consumers.

2.  **Detailed Restore Point Breakdown:** An interactive accordion for each VM/server. Click any VM to expand its section and see a full list of all its restore points—both fulls and incrementals—along with their individual sizes and creation dates, sorted from newest to oldest.


## How to Use the Script

1.  Save the code below as a `.ps1` file (e.g., `Get-VaultReport.ps1`).
2.  Edit the two variables at the top of the script: `$RepositoryName` and `$ReportDirectory`.
3.  Run the script from PowerShell on your Veeam Backup & Replication server or any machine with the Veeam Console installed.

An HTML report with the current date as the filename will be saved in the directory you specified. 

You could easily add automation to this script to send the report by email.


## Automating the Report with Task Scheduler

You can easily run this report automatically on a schedule. Here’s a quick guide for Windows Task Scheduler:

1.  **Open Task Scheduler:** Search for "Task Scheduler" in the Start Menu and open it.
2.  **Create a Task:** In the Actions pane, click **Create Task...**. Give it a name like "Veeam Daily Vault Report".
3.  **Configure Security:** On the **General** tab, select **Run whether user is logged on or not** and check the box for **Run with highest privileges**. You will need to set the user account that will run the task; this account must have permissions to interact with Veeam.
4.  **Set the Trigger:** Go to the **Triggers** tab and click **New...**. Set your schedule, for example, **Daily** at 7:00 AM.
5.  **Define the Action:**
      * Go to the **Actions** tab and click **New...**.
      * Set the Action to **Start a program**.
      * In the **Program/script** box, type: `powershell.exe`
      * In the **Add arguments (optional)** box, type: `-ExecutionPolicy Bypass -File "C:\Path\To\Your\Get-VaultReport.ps1"`
        *(Make sure to use the full, correct path to your script.)*
6.  **Save the Task:** Click **OK**. You'll be prompted to enter the password for the user account running the task.

-----

## The PowerShell Script

```powershell
<#
.SYNOPSIS
    Generates a consolidated HTML report for a Veeam repository by iterating
    through each job and querying its restore points directly.

.DESCRIPTION
    This script connects to Veeam and targets a specific repository. It finds all
    backup jobs using that repository and, for each job, gets the restore points
    directly to build the final report. 
#>

# --- START OF CONFIGURATION ---

# IMPORTANT: Change this value to the exact name of your backup repository.
$RepositoryName = "vdc-vault-centralUS"

# IMPORTANT: Specify the directory where you want to save the HTML report.
# The script will automatically create this directory if it doesn't exist.
$ReportDirectory = "C:\Scripts\Reporting\Reports"

# --- END OF CONFIGURATION ---


# Helper function to get the day with the correct suffix (st, nd, rd, th)
function Get-DayWithSuffix {
    param($date)
    $day = $date.Day
    switch ($day) {
        { $_ -in @(1, 21, 31) } { return "${day}st" }
        { $_ -in @(2, 22) }    { return "${day}nd" }
        { $_ -in @(3, 23) }    { return "${day}rd" }
        default                { return "${day}th" }
    }
}

# --- SCRIPT EXECUTION ---

# Generate the dynamic report filename
$dayString = Get-DayWithSuffix (Get-Date)
$monthYearString = (Get-Date).ToString("MMMM yyyy")
$reportFileName = "$($dayString) $($monthYearString).html"
$ReportPath = Join-Path -Path $ReportDirectory -ChildPath $reportFileName

# Ensure the output directory exists.
if (-not (Test-Path -Path $ReportDirectory)) {
    New-Item -Path $ReportDirectory -ItemType Directory -Force | Out-Null
}

# Load the Veeam PowerShell snap-in
Add-PSSnapin -Name VeeamPSSnapin -ErrorAction SilentlyContinue

# Get the specified repository object
$Repository = Get-VBRBackupRepository -Name $RepositoryName
if (-not $Repository) {
    Write-Error "Repository '$RepositoryName' could not be found."
    return
}

Write-Progress -Activity "Generating Veeam Repository Report" -Status "Finding jobs in repository..." -PercentComplete 10

# Find all backup jobs that use this repository.
$backupsInRepo = Get-VBRBackup | Where-Object { ($_.GetRepository()).Name -eq $RepositoryName }

$detailedResults = @()

Write-Progress -Activity "Generating Veeam Repository Report" -Status "Gathering restore point data..." -PercentComplete 25

# Loop through each backup job found.
foreach ($Backup in $backupsInRepo) {
    # Get restore points directly from the backup job object. 
    $restorePointsForJob = Get-VBRRestorePoint -Backup $Backup
    
    foreach ($rp in $restorePointsForJob) {
        $storage = $rp.FindStorage()
        $sizeBytes = $storage.Stats.BackupSize

        $detailedOutput = [PSCustomObject]@{
            VMName            = $rp.VmName
            JobName           = $Backup.Name
            PointCreationTime = $rp.CreationTime
            PointType         = $rp.Type
            PointSizeGB       = [Math]::Round($sizeBytes / 1GB, 2)
        }
        $detailedResults += $detailedOutput
    }
}


# --- Report Generation ---
if ($detailedResults) {
    Write-Progress -Activity "Generating Veeam Repository Report" -Status "Processing data for summary..." -PercentComplete 60
    
    $summaryResults = @()
    $vmsGrouped = $detailedResults | Group-Object -Property VMName

    foreach ($vmGroup in $vmsGrouped) {
        $calculatedTotalSize = ($vmGroup.Group | Measure-Object -Property PointSizeGB -Sum).Sum
        $summaryOutput = [PSCustomObject]@{
            VMName                = $vmGroup.Name
            JobName               = ($vmGroup.Group | Select-Object -First 1).JobName
            CalculatedTotalSizeGB = [Math]::Round($calculatedTotalSize, 2)
            RestorePoints         = $vmGroup.Group.Count
        }
        $summaryResults += $summaryOutput
    }

    Write-Progress -Activity "Generating Veeam Repository Report" -Status "Building HTML structure..." -PercentComplete 80

    $accordionHtml = "<section class='accordion'>"
    $accordionCounter = 0
    foreach ($vmGroup in $vmsGrouped) {
        $accordionCounter++
        $vmName = $vmGroup.Name
        $jobName = ($vmGroup.Group | Select-Object -First 1).JobName
        $totalSize = ($vmGroup.Group | Measure-Object -Property PointSizeGB -Sum).Sum
        $totalSizeRounded = [Math]::Round($totalSize, 2)
        $oldestPoint = $vmGroup.Group | Sort-Object PointCreationTime | Select-Object -First 1
        $oldestDate = $oldestPoint.PointCreationTime.ToString("yyyy-MM-dd")
        $labelString = "$vmName | Job: $jobName | Total Size: $totalSizeRounded GB (Oldest: $oldestDate)"
        $pointsForTable = $vmGroup.Group | Sort-Object PointCreationTime -Descending
        
        $accordionHtml += @"
    <div class="tab">
        <input type="checkbox" name="accordion-$accordionCounter" id="cb$accordionCounter">
        <label for="cb$accordionCounter" class="tab__label">$labelString</label>
        <div class="tab__content">
            <table>
                <tr>
                    <th>Point Creation Time</th>
                    <th>Point Type</th>
                    <th>Point Size (GB)</th>
                </tr>
"@
        foreach($point in $pointsForTable){
            $accordionHtml += @"
                <tr>
                    <td>$($point.PointCreationTime.ToString("yyyy-MM-dd HH:mm:ss"))</td>
                    <td>$($point.PointType)</td>
                    <td>$($point.PointSizeGB)</td>
                </tr>
"@
        }
        $accordionHtml += "</table></div></div>"
    }
    $accordionHtml += "</section>"

    $head = @"
<style>
:root { --theme: #00d15f; --background: #f8f9fa; }
body { font-family: 'Segoe UI', sans-serif; margin: 20px; background-color: var(--background); }
table { border-collapse: collapse; width: 100%; margin: 0; }
th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
th { background-color: var(--theme); color: white; }
tr:nth-child(even) { background-color: #f2f2f2; }
h1, h2, h3 { text-align: center; color: #333333; }
h1 { font-size: 28px; }
h2 { font-size: 22px; font-weight: 600; }
h3 { font-size: 18px; font-weight: 400; border-top: 2px solid var(--theme); padding-top: 20px; margin-top: 40px;}
p { text-align: center; font-style: italic; color: #666;}
/* Accordion Core Styles */
.accordion { border: 2px solid var(--theme); border-radius: 0.5rem; overflow: hidden; max-width: 90%; margin: 20px auto; }
.tab { position: relative; }
.tab input { position: absolute; opacity: 0; z-index: -1; }
.tab__content { max-height: 0; overflow: hidden; transition: max-height 0.35s; background-color: #fff; }
.tab input:checked ~ .tab__content { max-height: 40rem; overflow-y: auto; }
/* Accordion Visual Styles */
.tab__label { display: flex; color: white; background: var(--theme); cursor: pointer; justify-content: space-between; padding: 1rem; font-weight: 500; font-size: 0.9rem; }
.tab__label::after { content: "\276F"; width: 1em; height: 1em; text-align: center; transform: rotate(90deg); transition: transform 0.35s; }
.tab input:checked + .tab__label::after { transform: rotate(270deg); }
</style>
"@
    
    $summaryHtml = $summaryResults | Sort-Object -Property CalculatedTotalSizeGB -Descending | ConvertTo-Html -Fragment
    
    $htmlBody = @"
<h1>Veeam Repository Consumption Report</h1>
<h2>Repository: $($Repository.Name)</h2>
<h3>VM Storage Summary</h3>
<p>This table shows a calculated total storage space consumed by each VM's backup chain.</p>
$($summaryHtml)

<h3>Detailed Restore Point Breakdown</h3>
<p>Click on a VM to expand and see its full backup chain.</p>
$($accordionHtml)
"@

    ConvertTo-Html -Head $head -Body $htmlBody -Title "Veeam Consumption Report" | Out-File -FilePath $ReportPath
    
    Write-Progress -Activity "Generating Veeam Repository Report" -Status "Complete" -PercentComplete 100 -Completed
    Write-Host "Report generation complete." -ForegroundColor Green
    Write-Host "Location: $ReportPath"

} else {
    Write-Progress -Activity "Generating Veeam Repository Report" -Status "Complete" -PercentComplete 100 -Completed
    Write-Warning "No restore points found in the repository '$($Repository.Name)'. No report was generated."
}
```