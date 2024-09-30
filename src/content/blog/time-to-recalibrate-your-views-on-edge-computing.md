---
title: 'Time to recalibrate your views on edge computing' 
description: 'After returning from Edge Field Day [https://techfieldday.com/efd/]  #1 I have
had the chance to reflect more on what I thought edge computing
[https:'
heroImage: '/content/images/2023/05/Recalibrate-views-edge-computing.jpg'
slug: 'time-to-recalibrate-your-views-on-edge-computing'
pubDate: '2023-05-24T17:25:45.000Z'
tags: ["techfieldday", "edgefieldday", "edge"] 
categories: ['veeam']
author: ["ben"]
---

After returning from [Edge Field Day](https://techfieldday.com/efd/) #1 I have had the chance to reflect more on [what I thought edge computing](https://benyoung.blog/what-is-the-edge-thoughts-before-the-first-edge-field-day/) was going into it and how my views may have changed after speaking to and hearing from some very innovative vendors who are deep in this space.

So what has changed? Well a lot of what I thought going into the few days in San Francisco was true.

Here were my views going into this event are they still accurate?

- Latency sensitive workloads ✅
- Sites where there is limited, patchy or poor connectivity ✅
- Privacy, compliance or sensitive workloads ✅

But here are my key takeaways:
![](/content/images/2023/05/image-21.png)
### Think smaller and wider

Edges can be tiny! From a few Intel NUC's and upward - my view going into this was edges are really only required if you have big enough workload to warrant using a cluster of a few servers or more hosting some meaningful workloads. 

We we presented with Intel NUC clusters from Scale Computing - this company is doing great things in this space. They certify the entire unit and give you the ability to run hyper converged resilient infrastructure on a NUC sized device whatever the size might be. I love what they are doing and expect a few deep dives on them coming soon. 

Zededa presented on this a touch too, although not hardware providers in their own right are making an open source operating system designed to run on a wide range of devices - from something industrial with about as much horsepower as a raspberry pi through to a more traditional desktop sized machines with GPU and everything in between.

So that is the smaller piece - what about the wider bit? After a bit of a recalibration in my mind where I was thinking a company if they are a big global player *may *have a few hundred or few thousand edges, this is more like 10's of thousands. We heard a number of stories from the retail market in particular where it's not uncommon place to be managing >10k edges.
![](/content/images/2023/05/image-23.png)
### Trust absolutely nothing

We are already heading this direction with most aspects of IT these days but edge, certainly when compared too datacenter hosted workloads has it's own challenges.

Not only is power, cooling etc a challenge but physical security is a real problem. So you can't trust anything. 

Where possible disable all local management, usb ports, use a secure operating system environment with appropriate data encryption, purchase devices with hardware security functionality like TPM chips and utilise this as part of the stack and checks/balances across the deployment.

There is also the consideration of the device going missing during transit so carefully consider what get's shipped on the device and if it does contain data then all of the good practice security points mentioned above will assist with securing this information. 
![](/content/images/2023/05/image-25.png)
### Don’t rely on networks to be stable

An obvious one, but needs to be reiterated and explored a little more. You be externally monitoring these edges and have appropriate rules in place to simplify escalation and coordinations between IT departments/ticketing systems and at-the-edge resources like store staff members.

The other side to the coin is making the applications fault tolerant - it is no good having an application rely heavily on a cloud database or external time service if when the network goes down your application is dead in the water. Build in resiliency at the application layer to deal with this and if required provision additional workloads to allow for continued service (like a database with cloud sync).
![](/content/images/2023/05/image-20.png)
### Edges are becoming more advanced and “cloud like”

Developers and application teams have grown used to the tooling and platforms that are provided by most cloud providers these days. Container based workloads are being deployed, we have CI/CD pipelines, IaC providers like Terraform are being utilised, Logging and metrics platforms are enabled with the flick of a switch. 

So it was going to obviously mean that these personas will want to try and have as close to this "cloud like" experience for any edge applications they want to run. 

On the engineering side a lot of similar tools are being used, especially IaC like Terraform and configuration management like Ansible. When you are managing 100's if not 1000's of edges then this becomes an essential part of the day to day. So edges must be setup to support this.

Avassa is solving this for the application team by providing them cloud-like tooling to consume platform resource at the edge. But equally they are providing the engineering persona the ability to present what resources are available and what type of edge it is so application teams can focus on deploying the right workloads to the right place through their clever use of "tags". 
![](/content/images/2023/05/image-26.png)
### Centralised orchestration is a must

As has been mentioned we are more than likely dealing with thousands if not 10's of thousands of edges so being able to centrally manage and monitor it is critical. 

- Centralized management ensures efficient resource usage within IT or application teams
- It can manage consistent policies and standards, promoting uniformity across the infrastructure and allowing you to push this at scale to your edge(s)
- Enhanced security and compliance by allowing centralised monitoring access controls, and simplifying audits. 
- Troubleshooting downstream problems with centralised logging and observability enabled faster time to resolution and therefore should result in reduced downtime 

Most importantly though, centralised management enables all the nice IT buzz words.  Scalability, agility, and efficiency - Not just for new edge implementations but for any and all changes, upgrades, and expansions required to these edge sites. 

Most of the vendors presenting at Edge Field Day had these already, or at least on the roadmap - there was however varying approaches

- Avassa, Mako Networks, Zededa, Scale Computing all provide this as part of their offerings and certainly in Avassa and Mako Networks case, this is really the only way you interact with your edges
- Although Scale provide Fleet Manager, it is stil early (ish) in it's lifecycle and it is not a requirement, you can still, if you prefer manage it through their existing interfaces on the edge equipment
- Opengear has had a product called Lighthouse for a while - you can, if you wish connect any of your devices to this, or manage them directly. The difference here over some of the other vendors is that you need to self-host your own instance - a cloud version did not appear to be on the roadmap when questioned at Edge field day

![](/content/images/2023/05/image-24.png)
### Environments will vary

With edges becoming more popular it is not unexpected that these devices are now moving out of traditional, perhaps stable environments with consistent climate, power, cooling.

Even when the edge might be a retail store in a relatively safe, dry building often space is a limiting factor for devices, even network or power ports/feeds can, and often are at a premium - so these devices often need to be small, especially if you are having >1 for resiliency. 

Then there are true far-edge deployments, such as a compute node at the end of a crane performing critical health safety monitoring, or perhaps it's an environmental monitor for a solar farm in the middle of the desert, or on wind turbine in the north sea. 

Scale Computing have a clever platform that works, and is validated on the Intel NUC eco system primarily - they have a growing number of supported devices, from the lower power right into bigger, higher power devices in which you can deploy a 3 or more node cluster in order to have a resilient platform at your edge.

Zededa have found a niche in the more hardened devices and have arguably a bigger range (in terms of lower to higher power) devices. They showcased a fan free device about the power of a raspberry pi alongside a mini desktop device with a graphics card in it. They also currently have a growing list of validated devices but their operating system can be installed on almost anywhere.

Having a range of devices in your arsenal can assist your edge journey - don't be fixated on trying to standardise, it simply won't work unless you only have one, standard environment to install it into. 

The other solutions from Zededa, Avassa, and Scale can assist with being able to manage and monitor them in the same way, even though there may be differences in the underlying infrastructure. 
![](/content/images/2023/05/image-22.png)
### Who is driving mass edge adoption?

From the vendors I asked, and you could see it in the vendors presentations - Retail is paving the way again for compute to be pushed back down to these edge locations.

This of course is likely because retail chains often have hundreds, if not thousands of stores so if you are rolling out a new initiative then naturally, your probably going to do this for a lot of sites.

Avassa have a big focus in these clients at the moment and this is where most of their current customer base comes from, you can see why - centrally develop the applications and easily push to all of your retail chains? Yes please.

Mako Networks supply their devices to a large percentage of the "Petrochem" industry in northern America, aka, Service/Gas Stations. So much so they actually have another company in this region dedicated to delivering the full service to them. 

Scale Computing is in the box seat for anyone requiring a mature, resilient platform at pretty much any edge location. Their ability for you to select from a range of low power, cost effective nodes (or bigger if you need) means you can enjoy the benefits previously reserved for bigger, more expensive and power hungry devices with particular climate requirements. 

The next wave in my opinion will be big industry, particularly those with remote sites. As environmental laws change, health and safety becomes critical and the technology in the field starts requiring this technology to sit alongside these sites we will see a big expansion over and above what is already there. 

Starlink could also drive more adoption, where it has previously been either too expensive, or not even possible to get any internet connection this opens up an opportunity for the next generation of remote site to be brought-online, who knows what we will be able to deliver then.

