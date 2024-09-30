---
title: 'Veeam Replica disk audit using PowerCLI for vSphere'
description: 'Need to audit your virtual machine disk layouts from your production site vs your replica site? This quick script will get you started.'
heroImage: 'https://images.unsplash.com/photo-1549299096-56b3ebc3259a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjExNzczfQ'
slug: 'veeam-replica-disk-audit-using-powercli-for-vsphere'
pubDate: '2020-01-29T23:40:43.000Z'
tags: ["veeam", "powercli"] 
categories: ['veeam']
author: ["ben"]
---

Quick script Thursday. Need to audit your virtual machine disk layouts from your production site vs your replica site?

We use Veeam for replication and it does a sterling job of shipping the data from A to B but due to the way that snapshots occur disk removals from the production site are not populated to the replication site. 

Here is a very quick script to get you started and will rely on you having all replica machines with the _replica (or the same) suffix.

Quick rundown of what the code does

1. Connects to both Site A and Site B
2. Gets ALL virtual machines into a custom list, grabs total drive count for each
3. Filters out the replicas to a list(using a simple where name like **_replica*
4. Loop through the replicas and do a match against all VMS where the name matches the replica name *(without the _replica)*
5. Compare total number of disks
6. Print to screen the result

> You could take this as far as you need to, i.e automating the reseed via Veeams Powershell cmdlets etc

```
Connect-VIServer production-vsphere-address.local
Connect-VIServer replication-vsphere-address.local

$allVMs = Get-VM | Select-Object Name, @{N="Drives"; E={($_ | Get-HardDisk).count }}, ResourcePool
$replicas = $allVMs | Where-Object { $_.Name -like '*_replica' }

foreach ($replica in $replicas)
{
    $productionName = $replica.Name.Replace("_replica", "");
    $productionVM = $allVMs | Where-Object { $_.Name -eq $productionName}
    $productionVM
    if ($productionVM -eq $null)
    {
        Write-Host "$($productionName) was not found!" -BackgroundColor Red -ForegroundColor White
    }
    else
    {
        if ($productionVM.Drives -ne $replica.Drives) {
            Write-Host "$($productionName) has $($productionVM.Drives) drives and replica has $($replica.Drives)" -BackgroundColor Red -ForegroundColor White
        }  
        else {
            Write-Host "$($productionName) OK!" -BackgroundColor Green -ForegroundColor White
        }

    }
    
}

```

