---
title: 'JobSession link bug in Rest interface Veeam Office365 Backup'
description: 'If you fetch the job sessions for a job, the link for "log" is incorrect, have logged with Veeam which will hopefully patched in a future release.'
heroImage: '/content/images/2019/06/Screen-Shot-2019-06-17-at-11.27.19-AM.png'
slug: 'jobsession-link-bug-in-rest-interface-veeam-office365-backup'
pubDate: '2019-06-16T23:28:33.000Z'
tags: ["vbo", "veeam", "restful", "office365"] 
categories: ['veeam']
author: ["ben"]
---

If you fetch the job sessions for a job, the link for "log" is incorrect, have logged with Veeam which will hopefully patched in a future release.

### Example

> GET [https://172.30.6.90:4443/v3/jobs/2a347af6-43ef-43a7-97bf-58a36f8cf216/jobsessions](https://172.30.6.90:4443/v3/jobs/2a347af6-43ef-43a7-97bf-58a36f8cf216/jobsessions)

```json
    [{"id": "9f4eba99-ce30-419b-a942-354744045f51","creationTime": "2019-06-16T22:00:00.0246404Z","endTime": "2019-06-16T22:09:26.9479152Z","progress": 21,"status": "Success","statistics": {"processingRateBytesPS": 98010,"processingRateItemsPS": 0,"readRateBytesPS": 1426172,"writeRateBytesPS": 31686381,"transferredDataBytes": 55561549,"processedObjects": 523,"bottleneck": "Source"},"_links": {"self": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51"},"log": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/log"},"job": {"href": "https://172.30.6.90:4443/v3/jobs/2a347af6-43ef-43a7-97bf-58a36f8cf216"}}}]
 ```
    
Noting that the **_links** section has a log link as below

> [https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/](https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/)**log**


### This returns a 404

As per [the documentation](https://helpcenter.veeam.com/docs/vbo365/rest/get_job_sessions_session_id_log_items.html?ver=30) this should be **LogItems**

> for example [https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/](https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/)**LogItems**


### Which then returns the results as expected
```json
    {"offset": 0,"limit": 30,"results": [{"id": "35de947e-4512-4e71-8be4-1471d84ae21d","usn": 1,"title": "[Success] Job started at 17/06/2019 10:00:00 AM","creationTime": "2019-06-16T15:00:00.0402129-07:00","endTime": "2019-06-16T15:00:00.0402129-07:00","_links": {"self": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/logitems/35de947e-4512-4e71-8be4-1471d84ae21d"},"jobsessions": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51"}}},{"id": "c7347833-6127-4a50-b3cc-9a0b5dcbcf99","usn": 2,"title": "[Success] Connected to organization","creationTime": "2019-06-16T15:00:00.0558112-07:00","endTime": "2019-06-16T15:00:06.3683425-07:00","_links": {"self": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/logitems/c7347833-6127-4a50-b3cc-9a0b5dcbcf99"},"jobsessions": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51"}}},{"id": "231e6102-46c7-4abe-a4bc-c017e51d2da2","usn": 1000,"title": "[Success] Found 491 excluded objects","creationTime": "2019-06-16T15:00:06.3683425-07:00","endTime": "2019-06-16T15:08:02.6508329-07:00","_links": {"self": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51/logitems/231e6102-46c7-4abe-a4bc-c017e51d2da2"},"jobsessions": {"href": "https://172.30.6.90:4443/v3/jobsessions/9f4eba99-ce30-419b-a942-354744045f51"}}}....
    
```
        
    
    

