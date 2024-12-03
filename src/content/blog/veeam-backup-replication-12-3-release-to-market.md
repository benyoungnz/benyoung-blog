---
title: "Veeam B&R 12.3 - not just a point release!"
description: "Don't be fooled by this 'point' release. Veeam Backup & Replication 12.3 is absolutely packed with updates across every corner of modern IT. Whether you're looking at enhancements to security, cloud, on-premises, or even new workloads - it's all about building more resilience. There’s something here for everyone. Oh, did I mention AI? (of course there is!)" 
heroImage: '/content/images/2024/veeam-br-123-whatsnew.jpg'
slug: 'veeam-backup-replication-12-3-released'
pubDate: "2024-12-03T00:26:08.502Z"
tags: ["veeambackupreplication", "release"] 
categories: ['veeam']
author: ["ben"]
---
Don't be fooled by this "point" release. Veeam Backup & Replication 12.3 is absolutely packed with updates across every corner of modern IT. Whether you're looking at enhancements to security, cloud, on-premises, or even new workloads - it's all about building more resilience. There’s something here for everyone. Oh, did I mention AI? (of course there is!)

From protecting critical resources like Microsoft Entra ID and Nutanix AHV to boosting performance for backup and restores. Updates to database support for PostgreSQL and MongoDB, This release of 12.3 keeps raising the bar for what a modern data resiliency platform looks like. And speaking of security—backups can now help detect threats with tools like IoC Detection and Threat Hunter.

Storage and service providers get some serious love, too. The Veeam Data Cloud Vault bolts directly in and offers top-notch security and crazy durability with no DIY efforts to set up. Scale-out Backup Repository is now smarter and more flexible, letting you mix and match storage systems or lock down encryption where it matters most. And for service providers? Tenants can now handle their own disaster recovery failovers for snapshot & CDP policies. 


> 👉 Official docs: [Download](https://veeam.com/products/downloads/latest-version.html) // [What's New Document](https://veeam.com/veeam_backup_12_3_whats_new_wn.pdf) // [Release Notes](https://helpcenter.veeam.com/rn/veeam_backup_12_3_release_notes.html)


Let's dive in and explore **the TL;DR of the what's new**. I managed to shave around 50% off the always-impressive what's new document but you can always [get all of the details](https://www.veeam.com/veeam_backup_12_3_whats_new_wn.pdf) in the official doc.



### New Cloud Workload Support

#### Microsoft Entra ID

Microsoft Entra ID isn’t just about managing users and groups—it’s the backbone of your organization’s identity and access management. With Veeam, you can now protect this critical resource effortlessly.

Key features:

*   Quick Change Detection: Spot and reverse changes caused by human error, threats, or automated attacks. Perfect for forensic investigations with point-in-time snapshots.
*   Simplified Compliance: Automated backups reduce human error and ensure long-term audit log retention for incident investigations.
*   Fast Restores: Instantly recover app registrations and specific data to keep your business running.
*   Role-Based Restore Access: Veeam leverages Entra ID permissions, ensuring admins can only access what they’re authorized to restore.

### New Data Center Workload Support

#### Microsoft

Stay ahead with full support for Microsoft’s latest releases, including:

*   Windows Server 2025 & Windows 11 24H2: Seamless guest OS protection, backup component installation, and agent-based backup with Veeam Agent for Windows 6.3.
*   Hyper-V & SCVMM 2025: Protect virtual machines and streamline VM management while using advanced virtualization features.
*   SharePoint SE 24H2: Application-aware backups and item-level recovery with Veeam Explorer for SharePoint.

#### Nutanix AHV

Boost your Nutanix AHV protection with advanced Veeam capabilities:

*   App-Aware Backups: Microsoft VSS integration ensures consistent application backups and granular recovery with Veeam Explorers.
*   Guest File Indexing: Quickly locate files for self-service recovery via the Enterprise Manager web UI.
*   Inline Malware Detection: Instantly spot ransomware or suspicious activities with AI-powered tools.
*   Expanded NGT Control: Manage Nutanix Guest Tools settings at the job level for better granularity.

Note: New Nutanix AHV features are under experimental support, ensuring stable backups with additional disclaimers for new capabilities.

### New Database and Application Support

*   MongoDB: Now supports MongoDB 8 with backup policies introduced in V12.2.
*   PostgreSQL: Application-aware processing and item-level recovery for PostgreSQL 17.
*   Oracle RMAN: Support for Oracle 23ai, including cloud and engineered systems.
*   SAP HANA: Protect HANA databases on SLES 15 SP6 (x86-64) and RHEL 8.10.

### Veeam Agents Updates

*   Linux: Expanded support for the latest distributions, including AlmaLinux, Rocky Linux, RHEL, Oracle Linux, and Ubuntu on x86\_64 and IBM Power architectures.
*   Mac: Added macOS 15 (Sequoia) support with Veeam Agent for Mac 2.3.

### Cyber Resiliency Enhancements

#### Indicators of Compromise (IoC) Detection

Catch cyberattacks early with built-in detection for Indicators of Compromise (IoC) on protected machines. Leveraging file system indexing, V12.3 flags the sudden appearance of hacker tools commonly used for lateral movement, data exfiltration, and more. Veeam keeps this toolkit list updated to help reduce your Mean Time to Detect (MTTD) threats, giving you a chance to act before significant damage occurs.

This lightweight and scalable detection alerts you to potential issues, while suspected attacks can be further investigated with the Coveware Recon Scanner available from
Coveware by Veeam
#### Veeam Threat Hunter

Backups can do more than recover data—they can help detect dormant threats. V12.3 introduces Veeam Threat Hunter, combining YARA's speed with the malware detection breadth of antivirus solutions. Fully integrated into Veeam Backup & Replication, Threat Hunter scans backup content faster than traditional antivirus while minimizing overhead.

Key benefits include:

*   Built-in efficiency: Optimized, fast malware scans without the need for third-party antivirus management.
*   Advanced detection: Machine learning and heuristics identify threats like polymorphic malware that static YARA rules can’t catch.
*   Real-time updates: Threat signatures and ML models are updated multiple times daily to tackle evolving risks.

#### Veeam Data Cloud Vault

The updated Veeam Data Cloud Vault integration streamlines onboarding for instant access to reliable and cost-effective storage.

Key benefits:

*   Top-tier security: Always immutable, always encrypted, with up to 12 nines of durability.
*   Competitive pricing: New editions for primary and secondary backups with all-inclusive pricing that’s lower than DIY hyperscaler solutions.
*   Effortless setup: Manage your Vault directly within Veeam Data Platform for a seamless experience.
*   Unmatched flexibility: Use Vault with any product edition, including the free Community Edition.

### Veeam Intelligence

Veeam Intelligence delivers AI-driven insights directly into the Veeam Data Platform. Powered by Veeam AI Assistant, it helps admins optimize backups, troubleshoot issues, and address risks—without accessing environment-specific data.

Looking for more AI capabilities? Opt into advanced Veeam Intelligence for natural language reporting on backup infrastructure and production environments via Veeam ONE. 

### Other Features and Enhancements

#### Security

##### Malware Detection

*   Smarter "Mark as Clean": Once you mark a machine as clean, the backup server adjusts its deleted files threshold to prevent future false positives for similar changes.
*   Default Malware Index Retention: The retention policy now defaults to 14 days, reducing catalog size and server load during analysis—validated through customer feedback.

##### Security & Compliance Analyzer

*   Encryption Password Check: This new feature checks the strength of your backup encryption passwords, emphasizing the importance of long and complex ones to prevent brute-force attacks.

##### Security Events

*   Syslog Filtering: Customize syslog output by excluding less important events based on IDs and severity, perfect for managing costs with cloud-based monitoring systems.

#### Image-Level Backups

##### Backup Copy Enhancements

*   Rotated Drives Support: You can now create and target Backup Copy jobs on rotated drive repositories—true airgap protection without compromises!
*   Cloud Connect as a Target: Send Backup Copy jobs to cloud repositories, keeping a copy of your data both on-premises and with a Cloud Connect provider.
*   Recovery Improvements

##### Instant VM Recovery

Recover up to **200 VMs 4x faster** (10 min vs. 45 min) while using less CPU and RAM—thanks to major scalability upgrades.

##### File-level Recovery

*   Linux File-Level Recovery now restores files up to 5x faster on Linux, Mac, AIX, and Solaris, with the biggest gains for large files File-level restores.  
*   OpenText Open Enterprise Server (OES) 24.1 support – the NSS file-level restore helper appliance has been updated to enable support for OES 24.1.

#### Continuous Data Protection (CDP)

*   Longer Retention: Short-term retention expands from 1 to 7 days, allowing for cover over weekends and public holidays.
*   Policy Cloning: Easily replicate CDP policies to simplify and speed up provisioning for different SLAs, locations, or proxy settings.

#### Unstructured Data Backup

*   NetApp SnapDiff Integration: Incremental backups for NetApp filers are faster and less taxing on storage, thanks to SnapDiff API support.
*   NetApp FSx Support: File share backups now officially support Amazon FSx for NetApp ONTAP, ensuring reliable protection for your critical cloud data.

#### Agents

##### Agent Management

Windows agents now support the `matchbackupserver` parameter for the `setVBRsettings` command, letting preconfigured agents retain settings as long as the backup server stays the same—no reconfiguration needed.

##### Veeam Agents for AIX and Solaris

*   Direct File Recovery: Restore files directly to the target host for faster, more secure recoveries.
*   Publish Backup: Access backup disks directly on the target system for tasks like bulk recovery or scanning. Changes are discarded when the backup is unpublished.

##### Veeam Agent for Mac

Smarter Backups: The agent now detects macOS Low Data Mode and hotspots, avoiding metered networks for more efficient backups.

##### Veeam Agent for Microsoft Windows

*   Effortless Bare Metal Recovery: Recovery just got a whole lot easier. You can now automate the process using answer files, skipping the need for manual inputs or extensive training. This means faster restores to original or even different hardware—less stress for admins, more productivity for users.
*   Bare Metal Recovery from Manual Copies: Got a backup on a USB or other local storage? Now you can restore directly from it without needing a network connection to your repository. Super handy for those tricky situations!
*   Smarter Backup Network Detection: If your machine has multiple network interfaces, there’s a new tweak to help backups pick the fastest route. It’s not on by default (we don’t want to surprise you in a minor release), but it’s a registry-setting away from optimizing data flow and boosting performance.
*   Hiding Repository Sizes for Managed Agents: To save admins from awkward "Are we running out of space?" questions, we’ve hidden repository size and capacity details from end users. Admins know best—problem solved.
*   Expanded GFS Configuration Options: Aligning long-term retention with company policies just got more flexible. You can now fine-tune GFS (Grandfather-Father-Son) settings to specify which weeks you want for monthly backups.
*   GFS Restore Point Notifications: No more guesswork—job logs now clearly show when a GFS restore point is created, keeping you in the loop.

#### Enterprise Applications

##### General

*   Preferred Network Selection: Route backup traffic over dedicated networks for faster RPOs without affecting other workloads.
*   Faster Database Restores: Asynchronous read improvements make Oracle, MongoDB, and PostgreSQL restores up to 2x faster.

##### Microsoft SQL

Supports SQL Server Management Studio 20 and OLE DB Driver 19, including strict mode setups.

##### Oracle

Now supports Windows servers with multiple Oracle homes and simplifies corrupted block recovery with RMAN.

#### Backup Appliances

For **Google Cloud**, backup appliance deployment just got simpler. You can now spin them up straight from the backup console using Marketplace images—no custom setups needed. It’s quicker, more secure, and keeps things consistent, reducing errors and making your deployments more reliable. Plus, there’s expanded support for **Cloud SQL**, now covering SQL Enterprise edition and PostgreSQL v16. Oh, and security? Updated across the board, with the latest versions of .NET, PostgreSQL, and Ubuntu.

For **oVirt KVM** (covering RHV and OLVM platforms), you can now restore backups from virtually anywhere—physical, virtual, or cloud—directly to these hypervisors. This rounds out the Data Portability matrix, meaning full compatibility across the board. 

## Scale-out Backup Repository

**Migration just got a lot easier. **You can now mix extents from different object storage systems or with varying immutability settings within the same Performance and Capacity tiers. This means smoother transitions—whether you're switching to a new cloud provider or upgrading to immutable storage. Just seal the existing extents before adding new ones, and you’re set. 

**Encryption is now more flexible**. You can configure it directly at the Archive Tier, especially useful if you’re bypassing the Capacity Tier. Previously, you’d need to enable encryption in the backup job, which could disrupt deduplication in the Performance Tier. Now, you can encrypt backups only when they’re offloaded to the Archive Tier, giving you precise control.

**Support log collection is simpler too.** Instead of manually gathering logs from every server and job involved, you can now collect all relevant logs for a scale-out repository in one step, speeding up troubleshooting and reducing back-and-forth with support.

#### Storage Integrations

##### Object Storage

*   Automatic Bucket Provisioning: Some S3-compatible storage solutions struggle when buckets grow too large. To fix this, standalone object storage repositories can now auto-create new buckets based on the number of workloads protected. This reduces metadata database strain and improves performance. You can enable this for existing repositories, but it only applies to new workloads. Ensure your storage permissions allow for bucket creation and deletion. Check with your vendor before enabling, as some storage solutions handle this natively.
*   Background Checkpoint Removal Improvements: Updated timeout settings and more detailed error reports help diagnose object storage issues. Plus, checkpoint removal severity is now a warning (not an error), with the option to downgrade it further via a registry key.
*   SOSAPI Expansion: Nutanix AHV, Red Hat Virtualization, and Oracle Linux Virtualization Manager backups now leverage extended SOSAPI capabilities for better integration.
*   11:11 Cloud Storage: Integrated directly into the backup console for a smoother experience.

##### Secondary Storage

*   Dell Data Domain: Now supports DD OS up to version 8.1 with the latest DD Boost SDK.
*   HPE StoreOnce for Proxmox: Experimental support for Catalyst-powered backup copy jobs between Catalyst Stores is now available.

##### Tape Enhancements

*   Faster NAS Backup to Tape: Optimized read patterns and caching boost performance, especially for deduplicating storage. 
*   Granular Retries: Failed tasks are retried individually, reducing resource usage and improving efficiency.
*   General Improvements: Resolved edge-case issues for smoother NAS Backup to Tape operations. Version 12.3 is recommended for all users.
*   Resizable Tape Dialog: Tape media properties are now easier to view with a resizable dialog.

#### Backup Console

*   Performance Upgrades: Stability and speed improvements reduce resource consumption based on user feedback.
*   Database Logs Collection: You can now include PostgreSQL logs in the Export Logs wizard for better troubleshooting.
*   Quicker Help Access: The Help menu links directly to the Backup & Replication documentation. Press F1 for context-sensitive tips.

#### Enterprise Manager

*   Restore To: This feature, previously only in the console, is now in the web UI. Restore to any Windows server for added flexibility.
*   Better Restore Point Selection: Tooltips now show job names to help you pick the right restore point faster.
*   Secure LDAP Support: Enterprise Manager now supports secure LDAP for encrypted domain controller connections.

#### Service Providers

##### VMware Cloud Director

*   Self-Service Disaster Recovery: The Cloud Director Self-Service portal now lets tenants manage disaster recovery on their own. They can initiate failovers for VM snapshot-based replication jobs and CDP policies without needing provider assistance. Plus, tenants can configure VM snapshot-based replication jobs directly, giving them more control and flexibility.
*   Malware Detection: Malware scanning is now available for Cloud Director VM backups. Tenants can choose from YARA rule-based scans or signature-based antivirus options, including Veeam Threat Hunter. This lets service providers offer an extra layer of security by detecting active malware or dormant threats in client backups.

##### Veeam Cloud Connect

*   CDP Replica Testing: With v12.3, tenants and providers can now run test failover plans to verify CDP replica recoverability. The best part? Testing doesn't disrupt ongoing CDP replication—it runs smoothly in the background.
*   Expanded Restore Options: Service providers can now restore tenant backups directly to AWS EC2 or Microsoft Azure IaaS. This opens up new service possibilities and helps maximize value from hyperscaler contracts.

#### Rest API

Continually expanding, Veeam's REST API gives you more control and automation over your backup and restore processes.

New in 12.3:

*   Entra ID: Automate backups of your Entra ID tenant and audit logs. Easily browse and restore specific items from backup points.
*   Data Integration API (my favourite!): Mount data directly from backups without installing any Veeam components, previously triggered from Powershell only.
*   License Management: Automate license assignment, updates, and reporting.
*   Quick Backup: Trigger quick backups automatically, like when a malware alert is detected.
*   Authorization Events: Track and audit all authorization-related activities.
*   Syslog Event Filtering: Customize which events are sent to your syslog provider.
*   Backup Repository Monitoring: Check the status of your backup repositories and identify potential issues.
*   Enhanced Backup Statistics: Monitor backup job performance in detail, including occupied space