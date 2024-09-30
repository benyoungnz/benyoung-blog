---
title: 'Veeam Enterprise Manager failing Data Collection - Max Credential Length, SQL Exception' 
description: 'I had an Enterprise Manager instance start failing to collect data from the B&R
server. We rely on these APIs for customers to report on Backup job st'
heroImage: '/content/images/2022/03/sql-exception.jpg'
slug: 'veeam-enterprise-manager-failing-data-collection-max-credential-length-sql-exception'
pubDate: '2022-03-16T21:47:02.000Z'
tags: ["api", "enterprise manager"] 
categories: ['veeam']
author: ["ben"]
---

I had an Enterprise Manager instance start failing to collect data from the B&R server. We rely on these APIs for customers to report on Backup job status, restore capability and more.

I was seeing a few errors in the UI stating there was a SQL Exception, but it is pretty basic so we need to dive into the logs more.

**SVC.VeeamBES.Collect.log** files (located in C:\ProgramData\Veeam\Backup) there were a few more hits.

    [17.03.2022 09:38:46] <32> Info         Replicating changes from the table [Credentials]. Source Veeam Backup server [xxxxxxx.lan.local]
    [17.03.2022 09:38:46] <32> Info         Importing modified/new rows. Table: [Credentials], Number of rows: [107], TVP: [[dbo].[types.Credentials]], ImportRequest: [HasOutput: [False]]
    [17.03.2022 09:38:46] <32> Info         [DBRETRY] Nonretryable error has happened. Proc: [usp_Import_Credentials_Changes]. Error: [String or binary data would be truncated.
    [17.03.2022 09:38:46] <32> Info         The data for table-valued parameter "@importDoc" doesn't conform to the table type of the parameter. SQL Server error is: 8152, state: 10
    [17.03.2022 09:38:46] <32> Info         The statement has been terminated.]
    [17.03.2022 09:38:46] <32> Error        String or binary data would be truncated.
    [17.03.2022 09:38:46] <32> Error        The data for table-valued parameter "@importDoc" doesn't conform to the table type of the parameter. SQL Server error is: 8152, state: 10
    [17.03.2022 09:38:46] <32> Error        The statement has been terminated. (System.Data.SqlClient.SqlException)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavior, Boolean returnStream, Boolean async, Int32 timeout, Task& task, Boolean asyncWrite, Boolean inRetry, SqlDataReader ds, Boolean describeParameterEncryptionRequest)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.SqlCommand.RunExecuteReader(CommandBehavior cmdBehavior, RunBehavior runBehavior, Boolean returnStream, String method, TaskCompletionSource`1 completion, Int32 timeout, Task& task, Boolean& usedCache, Boolean asyncWrite, Boolean inRetry)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.SqlCommand.InternalExecuteNonQuery(TaskCompletionSource`1 completion, String methodName, Boolean sendToPipe, Int32 timeout, Boolean& usedCache, Boolean asyncWrite, Boolean inRetry)
    [17.03.2022 09:38:46] <32> Error           at System.Data.SqlClient.SqlCommand.ExecuteNonQuery()
    [17.03.2022 09:38:46] <32> Error           at Veeam.Backup.EnterpriseCollectorLib.CDataTableRowsImportCommand.UploadImportDataImpl(DataTable dataTable, CImportRequest importRequest)
    [17.03.2022 09:38:46] <32> Error           at Veeam.Backup.EnterpriseCollectorLib.CDataTableRowsImportCommand.UploadImportDataWithRetries(DataTable dataTable, CImportRequest importRequest)
    [17.03.2022 09:38:46] <32> Info         Data table is too big to serialize. Writing only first 10 rows
    
    ```
    
    Breaking it down, we can see the following line
    
        Importing modified/new rows. Table: [Credentials], Number of rows: [107], TVP: [[dbo].[types.Credentials]], ImportRequest: [HasOutput: [False]]
        
        ```
        
        Followed by a DBRETRY, and a SQL Exception being thrown, specifically "String or binary data would be truncated"
        
        We can see that the code is trying to execute the usp_Import_Credentials_Changes stored procedure on the VeeamBackupReporting (Enterprise Manager) database
        
        If you dive into that stored procedure through SSMS you can see it is passed some data via @importDoc and then the data is inserted into the EM database, specifically the c.Credentials table.
        ![](/content/images/2022/03/image.png)
        So, then taking a look at table we can see that this user_name has a max length of 255
        ![](/content/images/2022/03/image-1.png)
        but... over on the Veeam Backup and Replication database side see this has a nvarchar(MAX) type which is FAR bigger than is allowed on the EM side. *Also this is generally not great practice from a database perspective using MAX.*
        ![](/content/images/2022/03/image-3.png)
        I then opened the table up and sure enough, there was a credential that was > 255 characters.
        
        Removing the credential then let the job sessions sync again. Problem solved.
        
        However,  that got me thinking, there must not be any validation in the Veeam EM Restful API.
        
        If you open B&R, try add a credential, the GUI will only let you enter 255 characters, not a character more.
        ![](/content/images/2022/03/image-2.png)
        Let's see if my assumption is correct.
        
        You can use the EM API endpoint POST /backupServers/{ID}/credentials?action=create to create a credential
        
        I used the following payload, username is 266 characters.
        
            {
             "Username": "3eAga8WgkGiHn01OWWnaQc1jlTHQ060KCY8NgYyA7JUgyr9sWRoVk1uRtKQy1OITM4SvA08LNVCQbIoDSQaKMqpX4d2lZGibfL4cDcHTlb7icJGfg2jVp8qXamFKxLJVByWXUMLLk2v46QLsw5Kty73lWXB0zBlGsHinoEqycBBTOZHr7jUDmriazD6fXZj2o6TAJJ6BGAGoJJ7xNDdXn1u6ZW2IXmBm83GFNpBpghg8TrcbvmGk6ZfwyHcrkyu1",
             "Description": "big username 266 characters",
             "Password": "Superdooperpass"
            }
            
            ```
            
            And what do you know, it worked, 201 Created response.
            ![](/content/images/2022/03/image-4.png)
            And looking in the Veeam console, here it is.
            ![](/content/images/2022/03/image-5.png)
            So that confirms my theory there is not any validation here at the API layer
            
            Pretty easy fix from the Veeam side, match the database schema and add the validation, i'll pass this over to the product teams and hopefully we see a fix come through at some point.
            
            I doubt this will really effect many people but when you allow customers to drive their own credentials via your own self service portal then it could become an issue. I will be implementing steps to enforce max length which I probably should have done anyway. 
            
        
        
    
    

