---
title: 'Veeam Service Provider Console 7 API Changes v3.3' 
description: 'With any new release comes changes to the API, or at least new versions of the
API you can target.

Veeam Service Provider console Version 7 is a big '
heroImage: '/content/images/2023/02/veeam-service-provider-console-7-api-changes.jpg'
slug: 'veeam-service-provider-console-7-api-changes'
pubDate: '2023-02-10T02:17:13.000Z'
tags: ["veeam", "api", "serviceproviderconsole"] 
categories: ['veeam']
author: ["ben"]
---

With any new release comes changes to the API, or at least new versions of the API you can target.

Veeam Service Provider console Version 7 is a big release so there are a LOT of changes, a few breaking, some URL / routing changes but also a heap of new changes to support the new functionality. So if you are using 3.2 today (or lower) and are planning on moving to 3.3 of the schema, buckle up.

As you can see this has been a MASSIVE release and just goes to show the focus Veeam have been putting into their applications when it comes to programatic access.

### Breaking Changes

Let us start with these as if you target / use any of these then something is going to break...

Added the read-only:true attribute to the **automaticExtensionStatus** property of the PulseLicense schema. Any changes to the property value **will not apply**.

Removed the **isAutomaticExtensionEnabled** property from the PulseLicenseInput schema. For older client versions, the value will automatically have the false value.

Modified the **maximum values** of the following properties of the SubscriptionPlan schema:

- freeCloudStorageConsumedSpace
- freeFileShareBackupUsedSpace
- freeFileShareArchiveUsedSpace
- freeSourceAmountOfData
- freeCloudRepositoryConsumedSpace

The **new maximum values** depend on measurement units:

- 1048576 for GB
- 1024 for TB

If the value of the role property of the IdentityProviderRoleMappingRule schema is CompanyOwner or ResellerOwner, it cannot be modified. If the property value is different, it cannot be modified to become CompanyOwner or ResellerOwner.

Removed the **usedSockets** and **sockets** properties from the VOneServerLicense schema. The older client versions return the 0 value for these properties.

**Resource (model) changes**

- Removed the readOnly attribute from the organizationUid property of the UserInput schema.
- Removed the readOnly attribute from the userName property of the Credentials schema.
- Added the nullable:true attribute to the smtp property of the NotificationSettings schema. The property is no longer marked as required.
- Replaced the managementAgentVersion property of the About schema with the following properties:
- windowsManagementAgentVersion
- linuxManagementAgentVersion
- macManagementAgentVersion
- Added the fullHealthCheck property to the WindowsMaintenanceJobSettings schema.
- Added the fileShareUid and fileServerUid properties to the BackupServerFileShareJobObject schema.
- Applied the following changes to the SubscriptionPlan schema:
- Added the publicCloud and vb365 properties.
- The managedCloudVmPrice property of the SubscriptionPlanManagedBackup subschema replaced with the cloudVmPrice of the SubscriptionPlanPublicCloud subschema.
- The freeManagedCloudVms property of the SubscriptionPlanManagedBackup subschema replaced with the freecloudVms of the SubscriptionPlanPublicCloud subschema.
- The maxLength attribute of the description property now has the 2048 value.
- Added the monitoredServicePrice, managedCdpVmPrice and freeManagedCdpVms properties to the SubscriptionPlanManagedBackup schema.
- Added the companyServices and loginUrl properties to the Company schema.
- Added the companyServices property to the CompanyInput schema.
- Replaced the hierarchyRegerence property of the BackupServerCdpReplicationJobObject with the parentHostRef and hierarchyRef. For older version clients, the you can use the following algorithm:
- Added the workloads property to the PulseLicense schema.
- Added the siteUid property to the UserBackupResourceInput subschema of the UserInput schema.
- Added the siteUid property to the UserBackupResource schema.
- Added the isImmutabilityEnabled and immutabilityInterval properties to the BackupRepository schema.
- Added the externalIpList property to the CloudGateway schema.
- Applied the following changes to the Organization and OrganizationInput schemas:
- Added the locationAdmin0Code, locationAdmin1Code, and locationAdmin2Code properties.
- Changed the name of the companyId property to veeamTenantId.
- Added the siteUid property to the CompanySiteReplicationResourceUsage schema.
- Added the siteUid property to the CompanySiteVcdReplicationResourceUsage schema.
- Added the following properties to the ResellerQuota subschema of the Reseller and ResellerInput schemas:, isFileLevelRestoreEnabled, isThrottlingEnabled, throttlingValue, throttlingUnit, isBandwidthUnlimited, maxConcurrentTask
- Renamed the vbm365ServerUid property of the Vb365ServerLicense (previously Vbm365ServerLicense) schema to vb365ServerUid.
- Added the description and workloadsByPlatform properties to the WorkloadLicenseUsage schema.
- Added the clonedCloudServers and unsupportedCloudServers properties to the SingleLicenseReport schema.
- Added the unsupportedCloudServers property to the LicenseReportAppendix schema.
- Added the unsupportedClientServers property to the OrganizationUsageOfLicensesWithSameSupportId schema.
- Added the nullable:true attribute to the agentUid property of the BackupServerAgentJobObject schema.
- Renamed the fileServerUid property of the BackupServerFileShareCopyJobObject and BackupServerFileShareJobObject schemas to fileShareUid.
- **Deleted** the webUri property of the BrandingSettings schema.
- Added the oAuth2Credential property to the SmtpSettings schema.

Increased the maxLength attribute value to 1024 for the description property of the following schemas:

- BackupPolicy
- LinuxBackupPolicy
- WindowsBackupPolicy
- LinuxCustomJobConfiguration
- WindowsCustomJobConfiguration

- The mfaPolicyStatus property of the UserInput schema now includes the values of the UserMfaPolicyStatusInput enum instead of the UserMfaPolicyStatus enum.
- Added the IsAutomaticReportingEnabled property to the PulseLicenseInput schema.
- Applied the following changes to the NotificationAlarmsSettings schema:
- Added the DailyStatusFilter and DailySorting properties.
- Removed the nullable:true attribute from the dailySubject property. The older client versions will receive the following default value instead of null: Company: "%company%", Location: "%location%", Alarm: "%alarmName%", Status: "%alarmStatus%".
- Removed the nullable:true attribute from the subject property of the NotificationDiscoverySettings schema. The older client versions will receive the following default value instead of null: Company: "%company%", Location: "%location%", Rule: "%ruleName%", Status: "%ruleStatus%".
- Removed the instanceUid property from the UserInput schema.
- Applied the following changes to the ProtectedCloudVirtualMachineBackup schema:
- Added the policyName property.
- Renamed the jobUid property to policyUid.
- Renamed the totalRestorePointSize property to size.
- Removed the LatestRestorePointSize property.
- Increased the maximum value of the keepWeeklyBackupsForWeeks property of the WindowsGfsWeeklyRetentionSettings schema to 9999.
- Added the GfsRetentionSettings property to the LinuxBackupJobConfiguration schema. If the entity is created with the older version of REST API Client, the property value is null.
- Renamed the BackupServerImmediateBackupCopyJob schema to BackupServerSimpleBackupCopyJob.
- Renamed the LastAlarmActivation schema to AlarmActivation.

**Deleted** the following schemas:

> Deleted items, take note of these.

- ConsoleLicenseCounter
- ConsoleLicenseSummaryCounter
- ConsoleLicenseUsage
- CompanyConsoleLicenseUsage
- CloudLicenseCounter
- SiteCloudLicenseUsage
- CompanyCloudLicenseUsage
- BackupServerLicenseCounter
- BackupServerLicenseUsage
- CompanyBackupServerLicenseUsage
- VOneServerLicenseCounter
- VOneServerLicenseUsage
- CompanyVOneServerLicenseUsage
- Vbm365ServerLicenseCounter
- Vbm365ServerLicenseUsage
- CompanyVbm365ServerLicenseUsage

### Global Changes

These are changes that are not necessarily endpoint specific but could impact your integrations

- date and date-time values in p**ath and query parameters** now have the yyyy-MM-ddTHH:mm:ss.fffffffK format.
- Added the style:form with explode:false serialization support. **Comma delimiters are now used for query arrays**.

### Changes General

These can include path changes, and note there are some deleted operations, although the functionality has moved.

- Added the test parameter for the StartBackupFailoverPlan operation.
- SSO-related operations are now available to company users.
- Removed the ability to retrieve and modify the webUri values with the GetOrganizationBrandingSettings and PatchOrganizationBrandingSettings operations. These actions can now be performed with the GetOrganizationLoginUrl and ReplaceOrganizationLoginUrl operations that are available to company users.

### Changes to URL paths 

**GetProtectedCloudVirtualMachines**

- /protectedWorkloads/cloudVirtualMachines => /protectedWorkloads/publicCloud/virtualMachines

**GetProtectedCloudVirtualMachinesBackups**

- /protectedWorkloads/cloudVirtualMachines/backups => /protectedWorkloads/publicCloud/virtualMachines/backups

**GetProtectedCloudVirtualMachineBackupsByVm**

- /protectedWorkloads/cloudVirtualMachines/{cloudVirtualMachineUid}/backups => /protectedWorkloads/publicCloud/virtualMachines/{cloudVirtualMachineUid}/backups

**Other path changes**

- GetProtectedFileServers => GetProtectedOnPremisesFileShares
- GetVbm365Servers => GetVb365Servers
- GetVbm365Server => GetVb365Server
- ForceCollectVbm365Server => ForceCollectVb365Server
- GetVbm365ServersLicenses => GetVb365ServersLicenses
- GetVbm365ServerLicense => GetVb365ServerLicense
- InstallVbm365ServerLicense => InstallVb365ServerLicense
- PatchVbm365ServerLicense => PatchVb365ServerLicense
- UpdateVbm365ServerLicense => UpdateVb365ServerLicense
- GetBackupServerImmediateBackupCopyJobs => GetBackupServerSimpleBackupCopyJobs
- GetBackupServerImmediateBackupCopyJob => GetBackupServerSimpleBackupCopyJob
- GetBackupServerImmediateBackupCopyJobsByServer => GetBackupServerSimpleBackupCopyJobsByServer
- GetBackupServerImmediateBackupCopyJobsLinkedJobObjects => GetBackupServerSimpleBackupCopyJobsLinkedJobObjects
- GetBackupServerImmediateBackupCopyJobLinkedJobObjects => GetBackupServerSimpleBackupCopyJobLinkedJobObjects
- GetBackupServerImmediateBackupCopyJobsLinkedJobObjectsByServer => GetBackupServerSimpleBackupCopyJobsLinkedJobObjectsByServer

### Changes to Schema

- Replaced the request body schema of the **CreateSubscriptionPlan** operation from **SubscriptionPlanInput** to **SubscriptionPlan**.
- Replaced the request body schema of the **CreateLocation** operation from **OrganizationLocation** to **OrganizationLocationInput**.

**Assigned the Deployment tag to the following operations:**

- InstallBackupAgentOnDiscoveryComputer
- InstallLinuxBackupAgentOnDiscoveryComputer
- UpdateWindowsBackupAgent
- UpdateLinuxBackupAgent
- UpdateMacBackupAgent

Applied the following changes to the **InstallBackupAgentOnDiscoveryComputer** and **InstallLinuxBackupAgentOnDiscoveryComputer** operations:

- These operations now return deployment task UID immediately after the request is processed. To receive information on the installation completion, you can use the WaitDeploymentTask operation.
- If Veeam backup agent is already installed on the discovered computer, the operations return the null value.

The **UpdateWindowsBackupAgent**, **UpdateLinuxBackupAgent** and **UpdateMacBackupAgent** operations **now return deployment task UID immediately after the request is processed**. To receive information on the installation completion, you can use the **WaitDeploymentTask** operation.

The GetBackupServerJobs, GetbackupsServerJobsByServer and GetBackupServerJob no longer return public cloud policies.

**The following operations were deleted:**

> Deleted items, take note of these.

- GetSitesUsage
- GetSiteUsage
- GetSiteUsageByCompanies
- GetSiteUsageByCompany
- GetSiteUsageByTenantUID
- GetBackupServersUsage
- GetBackupServerUsage
- GetBackupServerUsageByCompanies
- GetBackupServerUsageByCompany
- GetBackupServerUsageByTenantUID
- GetVOneServersUsage
- GetVOneServerUsage
- GetVOneServerUsageByCompanies
- GetVOneServerUsageByCompany
- GetVOneServerUsageByTenantUID
- GetVbm365ServersUsage
- GetVbm365ServerUsage
- GetVbm365ServerUsageByCompanies
- GetVbm365ServerUsageByCompany
- GetVbm365ServerUsageByTenantUID
- GetConsoleLicenseUsage
- GetConsoleLicenseUsageByCompanies
- GetConsoleLicenseUsageByCompany
- GetConsoleLicenseUsageByTenantUID

The functionality of those operation is included in the GetOrganizationsLicenseUsage operation.

### New Items

Annnnd finally, here is a BUNCH of new operations which you can now build against in this version of the API.

**Accounts**

- CreateLocalUserRule
- DeleteLocalUserRule
- DiscoverObjectsForLocalUserRule
- GetLocalUserRule
- GetLocalUserRules
- PatchLocalUserRule

**Alarms**

- GetActiveAlarmHistory

**Async Actions**

- GetAsyncActionsInfo

**Backup Server Jobs**

- GetBackupServerCdpReplicationJob
- GetBackupServerCdpReplicationJobObjects
- GetBackupServerCdpReplicationJobs
- GetBackupServerCdpReplicationJobsByServer
- GetBackupServerCdpReplicationJobsObjects
- GetBackupServerCdpReplicationJobsObjectsByServer

**Backup Servers**

- DeleteBackupServersPublicCloudApplianceData
- GetBackupServerAgent
- GetBackupServerAgentsByServer
- GetBackupServerPublicCloudAppliance
- GetBackupServerPublicCloudAppliancesByServer
- GetBackupServersAgents
- GetBackupServersPublicCloudAppliances

**Cloud Connect**

- GetCloudBackup
- GetCloudBackups
- GetCloudBackupsBySite
- PatchSite
- SetSiteMaintenanceMode
- SetSiteTenantManagementMode

**Companies**

- CreateCompanyVb365BackupResource
- CreateCompanyVb365Resource
- DeleteCompanyVb365BackupResource
- DeleteCompanyVb365Resource
- GetCompaniesVb365BackupResources
- GetCompaniesVb365Resources
- GetCompanyVb365BackupResource
- GetCompanyVb365BackupResources
- GetCompanyVb365Resource
- GetCompanyVb365Resources
- PatchCompanyVb365BackupResource
- PatchCompanyVb365Resource

**Deployment**

- DeleteScheduledDeploymentTaskForAgent
- DeleteScheduledDeploymentTaskForComputer
- GetDeploymentTasks
- GetScheduledDeploymentTaskForAgent
- GetScheduledDeploymentTaskForComputer
- GetScheduledDeploymentTasksForAgent
- GetScheduledDeploymentTasksForComputer
- InstallBackupServerOnDiscoveryComputer
- PatchBackupServer
- PatchScheduledDeploymentTaskForAgent
- PatchScheduledDeploymentTaskForComputer
- ScheduleInstallBackupServerOnDiscoveryComputer
- SchedulePatchBackupServer
- ScheduleUpgradeBackupServer
- StartScheduledDeploymentTaskForAgent
- StartScheduledDeploymentTaskForComputer
- UpgradeBackupServer
- WaitDeploymentTask

**Licensing**

- DownloadLicensingReportCsv
- GetOrganizationsLicenseUsage

**Organizations**

- CompleteSmtpOAuth2SignIn
- GetOrganizationLoginUrl
- PrepareSmtpOAuth2SignIn
- ReplaceOrganizationLoginUrl

**Protected Public Cloud Workloads**

- GetProtectedCloudDatabaseBackupsByDatabase
- GetProtectedCloudDatabases
- GetProtectedCloudDatabasesBackups
- GetProtectedCloudFileShareBackups
- GetProtectedCloudFileShareBackupsByShare
- GetProtectedCloudFileShares

**Protected Workloads**

- GetVb365ProtectedObjects
- GetVb365RestorePoints

**Pulse**

- InstallPulseLicense

**Resellers**

- CreateResellerSiteWanAcceleratorResource
- CreateResellerVb365Resource
- DeleteResellerSiteWanAcceleratorResource
- DeleteResellerVb365Resource
- GetResellerSiteWanAcceleratorResource
- GetResellerSiteWanAcceleratorResources
- GetResellerVb365Resource
- GetResellerVb365Resources
- GetResellersSiteWanAcceleratorResources
- GetResellersVb365Resources
- PatchResellerSiteWanAcceleratorResource

**Veeam Backup for Microsoft 365 Server**

- ActivateVb365Server
- CheckVb365Microsoft365OrganizationCertificateExistenceInTheStorage
- CreateAzureDeviceCode
- CreateVb365BackupJob
- CreateVb365CopyJob
- CreateVb365Microsoft365Organization
- CreateVb365OrganizationToCompanyMapping
- DeleteVb365Job
- DeleteVb365Organization
- DeleteVb365OrganizationToCompanyMapping
- DeleteVb365Server
- DisableVb365Job
- EnableVb365Job
- GetAzureDeviceCodeStatus
- GetUnactivatedVb365Server
- GetUnactivatedVb365Servers
- GetVb365BackupJob
- GetVb365BackupJobs
- GetVb365BackupProxies
- GetVb365BackupRepositories
- GetVb365CopyJob
- GetVb365CopyJobs
- GetVb365Jobs
- GetVb365Microsoft365Organization
- GetVb365Microsoft365Organizations
- GetVb365Organization
- GetVb365OrganizationGroups
- GetVb365OrganizationSites
- GetVb365OrganizationTeams
- GetVb365OrganizationToCompanyMapping
- GetVb365OrganizationUsers
- GetVb365Organizations
- GetVb365OrganizationsByVb365Server
- GetVb365OrganizationsToCompanyMappings
- PatchVb365BackupJob
- PatchVb365CopyJob
- PatchVb365Microsoft365Organization
- StartVb365Job
- StopVb365Job

