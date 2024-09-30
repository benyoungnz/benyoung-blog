---
title: 'Veeam Data Platform, some APIs and a Large Language Model walk into a bar.' 
description: 'What if I told you you can talk to your backup server? Gain insights and drive
actions. All with no trickery, no pre-exported datasets - in real time,'
heroImage: '/content/images/2023/11/Veeam-VBR-APi-LargeLanguageModel.jpg'
slug: 'veeam-data-platform-some-apis-and-a-large-language-model-walk-into-a-bar'
pubDate: '2023-11-02T20:45:40.000Z'
tags: ["ai", "api", "veeam"] 
categories: ['veeam']
author: ["ben"]
---

What if I told you you can talk to your backup server? Gain insights and drive actions. All with no trickery, no pre-exported datasets - in real time, via the Veeam Backup VBR API?

Well today I am presenting a small working proof of concept that I developed during the Veeam 100 Summit in Prague this week. 

I can't wait to give it some more super-powers, but let's take a look at what data it has access to before we dive into some sample "discussions" I had with my home lab back home from Prague Airport.

### Tech stack and notes

- This uses the [**Veeam VBR Rest API**](https://helpcenter.veeam.com/docs/backup/vbr_rest/overview.html?ver=120)
*I have talked many times about this before.*
- The prototype is **built with Node.js**
*It provides the local API the frontend talks to, and makes required calls to my VBR server and OpenAI.*
- **OpenAI** is providing the model*, specifically,  gpt-3.5-turbo-0613

*I am wanting to try this with a locally hosted model - given the potentially sensitive nature of backup server data a local model I believe will be the default for most - but for a prototype and my lab environment I am comfortable using this solution for now. 

### Skills it has

To provide this demo I focused on Backup Jobs and Backup Sessions and it talks to 4 VBR Rest API endpoints for this. 

Obviously needs to be expanded but this gives us a good feel for the possibilities we have now we can bridge real time data from an API with a LLM.

- /api/v1/jobs (Fetch all jobs)
- /api/v1/jobs/states (Fetch all job states)
- /api/v1/jobs/${id}/start (Start a job with a given ID)
The ID is not hard coded, the LLM works out what what the backup job ID is and pulls this from the backup job json returned and passes it to this endpoint as required.
- /api/v1/sessions (Fetch backup sessions)

### Demo

It's a bit slow as I am on 4g at the airport and the B&R server is a on the other side of the world but it works well enough.

**The transcript**
Screenshot below if you can't view the video, and full transcript below, my questions in bold.
![](/content/images/2023/11/image.png)
**What backup jobs do I have, list them and provide a total count?**

You have the following backup jobs:

1. Data Integration API Demo
2. K3S
3. One K3s
4. Tagged Based - Protect Important

**What was the last backup job to run?**

The last backup job to run was "Tagged Based - Protect Important."

**When did it run?**

The backup job "Tagged Based - Protect Important" last ran on November 3, 2023, at 8:58 AM.

**What is the job id of the Demo job?**

The job ID of the "Data Integration API Demo" backup job is 80e31ea9-74b4-4e0b-a4d8-72359b233cee.

**Can you start that job?**

The job with ID "80e31ea9-74b4-4e0b-a4d8-72359b233cee" has been started. Its name is "Data Integration API Demo" and it started on November 3, 2023, at 9:26 AM.

**What backup jobs are running?**

Currently, there is one backup job running. The running job is "Data Integration API Demo" with the job ID "adb05df2-8b09-40dc-8ebd-f53cdb09c4f8". It started on November 3, 2023, at 9:26 AM.

**What is its progress?**

The progress of the backup job "Data Integration API Demo" (Job ID: adb05df2-8b09-40dc-8ebd-f53cdb09c4f8) is currently at 0%.

**What time did it start again?**

The backup job "Data Integration API Demo" (Job ID: adb05df2-8b09-40dc-8ebd-f53cdb09c4f8) was started on November 3, 2023, at 9:26 AM.

**Can you convert that to pacific time?**

The backup job "Data Integration API Demo" (Job ID: adb05df2-8b09-40dc-8ebd-f53cdb09c4f8) was started on November 3, 2023, at 9:26 AM Pacific Time.

**Thanks!**

You're welcome! If you have any more questions, feel free to ask.

