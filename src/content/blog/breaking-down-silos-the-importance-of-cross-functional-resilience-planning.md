---
title: "Breaking Down Silos: The Importance of Cross-Functional Resilience Planning"
description: "The ransomware problem isn't just about better technology—it's about how IT and security teams collaborate."
heroImage: '/content/images/2025/importance-of-cross-functional-planning.jpg'
slug: 'breaking-down-silos-the-importance-of-cross-functional-resilience-planning'
pubDate: "2025-06-12T22:55:56.336Z"
tags: ["ransomware", "business"] 
categories: ['veeam']
author: ["ben"]
---

Most of us in this IT industry pride ourselves on making decisions based on data, not assumptions. We love to measure everything: uptime, performance metrics, security posture, and even in our personal lives—monitoring our [grill temperatures](https://www.reddit.com/r/homelab/comments/lhxpqd/if_you_dont_have_your_smoker_thermometer_data_in/) with the same precision we bring to our data centers.

But here's the uncomfortable irony: while we can tell you the exact temperature of our weekend barbecue from anywhere in the world, most organisations are flying completely blind when it comes to their backup integrity and recovery capability.

Think about these questions. When was the last time you saw a dashboard showing backup verification results? When did you last run a tabletop exercise and recovered more than a handful of machines? When did you last practise a containment strategy? How often do you receive reports on actual recovery time objectives based on real-world testing rather than theoretical calculations?

The truth is this lack of visiblity and isn't just technical - it's organisational. The findings from our Veeam Ransomware Trends Report 2025 reveal that the gap between IT operations and security teams is creating dangerous vulnerabilities that ransomware groups systematically exploit.

Organisations are acknowledging they need better collaboration between IT and security teams. 89% of those surveyed are seeing their backup repositories directly targeted by threat actors which is down slightly on previous results but still a large percentage. It's clear that this isn't just about technology—it's about how we organize, collaborate, and prepare for the inevitable.


## The Illusion of Backup Preparedness

Our latest Veeam research paints a pretty black and white picture of this blind spot. The 2025 report saw 1,300 organisations participate and it even included real work (non-survey) data from Coveware who deal with 100's of cyber extortion events every year. 

The biggest takeway, a troubling disconnect between what IT teams think they know about their backups and what's actually happening in the real world.

**The Hard Facts About Backup Reality:**

> 89% had their backup repositories targeted by threat actors, with an average of 34% of backup repositories modified or deleted. 

Let that sink in for a moment. 

They're going straight for your backups because they understand something that many IT teams haven't fully grasped: backups are the recovery lifeline, often the last resort if all of our other preparations fail. If they can compromise that lifeline, a big step toward guaranteeing their payday.

Modern ransomware groups have shown us and the data shows they systematically hunt through your network (lateral movement), identify your backup infrastructure, and methodically destroy or corrupt your recovery options before triggering the primary attack, often our hypervisors or other high value targets.

Even more concerning, especially given this technology has been around for many years... 

> Only 32% of organisations used repositories or services configured as immutable

What do we mean by immutable? In essence it's data that can't be changed after it's created, this includes deletion or modification of any sort.

Without backup immutability, this leaves the majority vulnerable to attacks that can wipe out both the backups they're counting on for recovery. 

This means that 68% of organisations – more than two-thirds! – are essentially running their backup strategies like it's 2015, when the biggest threat was hardware failure, not sophisticated cyber extortion events.

## The Dangerous Confidence Gap

Now, here is the harsh truth from the report and one of the biggest takeways. 

> 69% of ransomware victims thought they were prepared before being attacked, but that confidence dropped by *more than 20%* post-attack.

This massive gap between perception and reality represents a fundamental failure in what we normally pride ourselves in - data-driven decision making.

Imagine if 69% of your financial forecasts were off by 20% or more. Imagine if 69% of your performance monitoring gave you false positives. You'd overhaul or change the system immediately. Yet when it comes to backup preparedness, we're tolerating this level of inaccuracy as if it's normal. So it's time to raise awareness and have some real converations. 

The report reveals some other statistics particularly around recovering from a cyber incident:

- While 98% of organisations had a ransomware playbook, less than half had key technical elements like backup verifications (44%) and containment plans (32%)
- Only 28% of organisations restored backups to sandbox environments for verification before production
- A shocking 39% of organisations had to restore data directly to production *without any verification*

Put another way... nearly 4 out of 10 organisations, when faced with a significant event, are essentially gambling with their entire business by restoring potentially malicious (or corrupted) data directly into production without testing. 

## The organisational Alignment Problem

When we look past the technical challenges, the report highlights an urgent need for stronger collaboration between IT operations and security teams.

While 52% of organisations said significant improvement or complete overhaul is required to align IT operations and security teams, only 11% believe little or no improvement is needed. 

> This means nearly 9 out of 10 organisations recognize that better collaboration is essential for effective cyber resilience.

Traditionally, security teams focus on preventing attacks while IT operations teams focus on maintaining system availability. Backup and recovery sits, perhaps awkwardly between these areas. Making cross-team planning and coordination not just beneficial, but essential. When teams work in silos, gaps emerge and as we have seenm, threat actors are quick to exploit.

As a data point - organisations currently devote 31% of IT budget to security and 28% to recovery on average. Underinvestment in either area can weaken the capacity to guard against and respond to cyber extortion events. We must continue to find right balance and not over correct one way. 

Excitingly the collaborative approach extends beyond individual organisations. Platform and technology vendors are partnering to aggregate ransomware intelligence and provide enhanced defense services and report data. Organisations that report ransomware attacks to law enforcement, regulatory authorities, and emerging partner networks contribute to collective defense strategies that benefit the entire ecosystem. 

I am a big advocate for disclosing these events to raise awareness.

When we raise awareness we move the discussions further up the stack, these coversations should be a the board level. 

The report shows that 94% of organisations increased their recovery budget for 2025 and 95% increased their prevention budget. I hope this is in some way atributed to more disclosure, social media and news outlets covering stories.

The path forward requires CIOs, CTOs and CISOs to collaborate between their teams and strike the appropriate balance in budget allocation but also cross-team planning and response exercises. 

## The Insurance Industry's Wake-Up Call

Even the cyber insurance industry is catching up. [In 2024, more than 40% of cyber insurance claims were denied, often due to inadequate security measures](https://www.dataversity.net/the-biggest-data-backup-disasters-of-2024-and-how-to-avoid-them-in-2025/)

This included regular backups, how long before, if not already that they start mandating that recoveries are tested as well?

Insurance companies are essentially saying: "If you can't prove your putting in the work to secure yourself, we're not covering your losses." They've done the math and realised that organisations with poor immature security and backup strategies are risks to their business.


## Wrapping up

The evidence from our Veeam Ransomware Trends Report 2025 is clear:

*Get the data you need.* Implement regular backup verification testing and recovery time objective measurements. If you can't produce a dashboard showing your actual backup success rates and recovery capabilities, you're operating on hope, not data.

*Eliminate the confidence gap.* The 20% drop in confidence post-attack tells us that perception and reality are dangerously misaligned. Regular red team exercises (cross-team!) and tabletop simulations can help calibrate expectations before you need them most.

*Bridge the organisational divide.* With 89% of organisations recognizing the need for better IT-security collaboration, this isn't just a technical problem—it's an organisational one. The traditional approach of security teams focusing on prevention while IT operations teams focus on availability has created dangerous gaps that ransomware groups exploit. When backup and recovery sits awkwardly between these teams, cross-functional planning becomes essential, not optional.

*Keep investments balanced.* Organisations currently allocate 31% of IT budget to security and 28% to recovery on average. Increasing budgets for 2025 shows awareness is growing, but the balance between prevention and recovery must be strategic, not reactive.

*Modernize your approach.* If you're among the 68% still using mutable backup repositories, you're essentially bringing a 2015 strategy to a 2025 fight. Immutable backups aren't a nice-to-have—they're table stakes in an era where 89% of organisations see their backup repositories directly targeted.

*Embrace collective defense.* Disclosure and awareness-raising moves these critical discussions to the board level where they belong.

*The ransomware groups have done their homework.* They understand your infrastructure, your weaknesses, and your recovery dependencies better than you might think. Even cyber insurance companies are catching up—with over 40% of claims denied in 2024 due to inadequate security measures, they're demanding proof that organisations are doing the work to protect themselves.

It's time to apply the same data-driven rigor to backup preparedness that we apply everywhere else in IT. Because when disaster strikes, the only measurement that matters is whether your backups actually work. And right now, too many organisations are about to find out the hard way that they've been measuring the wrong things all along.

## Download the Veeam Ransomware Trends Report 2025

 > Diver deeper into the numbers and commentary, [download the report](https://go.veeam.com/ransomware-trends) for free.