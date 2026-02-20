---
title: "The Real Security Flaw in AI Is Human Nature"
description: "A researcher backdoored the #1 AI skill and watched developers run it without question. The flaw wasn't technical. It was human."
heroImage: '/content/images/2026/ai-the-vulnerability-is-human.jpg'
slug: 'the-real-security-flaw-in-ai-is-human-nature'
pubDate: "2026-02-20T09:01:18.227Z"
tags: ["ai", "security"] 
categories: ['AI']
author: ["ben"]
---

There's something happening right now that no security policy can fix. People want AI so badly, so urgently, that the part of the brain that asks "should I trust this?" is simply switching off. Not because people are stupid. Because desire is stronger than caution.

It is history repeating itself. Something that started well before AI came along when it comes to shiny new technology. 

The latest? a skill - a simple as a markdown file on ClawdHub used for Moltbot (formerly ClawdBot). By the way, this skill pattern is being widely adopted across the industry. 

**"What Would Elon Do"** reached a faked number one on ClawdHub. It seemed popular (spoiler: it was faked), people downloaded it. It was a trap. Almost nobody noticed.

Security researcher Jamieson O'Reilly built it as a controlled experiment. Within eight hours, sixteen developers across seven countries had executed arbitrary commands on their own machines, clicked "Allow," and sent HTTP requests to a server they'd never heard of, run by someone they'd never met.

O'Reilly designed his payload to do nothing, just a ping to prove the point. 


## The Part We Skip

I [wrote about this in September 2025](/blog/mcp-backdoor-ai-supply-chain-vulnerability-security-tricks/), when the postmark-mcp backdoor surfaced. A malicious MCP server, downloaded 1,500 times every week, was silently copying thousands of emails daily to an attacker's server for months before anyone noticed. Password resets, financial documents, internal memos, all flowing quietly to giftshop.club while the tool kept working perfectly.

Five months later, here we are again. In fact there have been other notable incidents since then.... This time though it was a researcher, not an attacker. Next time we might not be so lucky.

> The pattern isn't technical. It's psychological. 

Until we're honest about that, we'll keep writing the same post-mortem.

## The Butler Problem

O'Reilly opens his writeup with a useful metaphor. Imagine you hire a butler. He's brilliant, manages your calendar, handles your messages, knows your passwords because he has to. Now imagine he starts photocopying everything that crosses his desk and mailing it to a stranger.

That's not a hypothetical anymore.

AI assistants are executing hundreds of tool calls a day on our behalf, autonomously, in the background, with permissions that would make a sysadmin uneasy. Full email access, database connections, API credentials, SSH keys. And connecting those assistants to new capabilities is as easy as running a single install command from a marketplace where anyone can publish, download counts are trivially faked, and the actual instruction files are hidden from the UI.

We handed the butler a master key and stopped watching.


## Why We Do It Anyway

Most security commentary treats people who fall for these attacks as naive or careless. O'Reilly pushes back on this, and he's right. "The 16 developers who ran my skill weren't careless or stupid. They're the same people building the tools we all rely on."

So what happened? The same thing that always happens when desire outpaces caution. These developers understand supply chain risk in the abstract. They've read about npm attacks. But the moment an AI tool promised something genuinely useful, that knowledge stepped aside for a simpler instinct. This looks legitimate, so it probably is.

High download count means popular. Popular means safe. Listed on an official registry means vetted. Permission prompts mean I'm in control.

None of those assumptions were true. O'Reilly had inflated the download count to 4,000 in under an hour with a bash script. The registry had no content vetting. The permission prompts were theatre. After fifty legitimate "Allow" clicks in a session, click fifty-one gets no scrutiny. The dangerous instructions were buried in a file the UI didn't render.

But the assumptions felt true. And in the race to get the next capability running, feeling is enough.


## The Acceleration Gap

AI capabilities are compounding at a rate security was never designed to match. New agent frameworks, new plugin marketplaces, new ways to extend what these systems can do appear every week. The attack surface grows faster than anyone can audit it.

The economics are laughably one-sided. O'Reilly registered his command-and-control domain in thirty seconds. The total cost was a domain registration fee. That's the barrier to entry. Meanwhile, most organisations have no inventory of which AI plugins are running in their environment, no visibility into what those tools are doing, and no way to know if a package installed six months ago has been quietly updated to include a backdoor. 

The postmark-mcp attacker demonstrated this precisely. Fifteen versions of legitimate behaviour, then version 1.0.16, one line of code, a single bcc field, and thousands of emails a day flowing to an attacker's server for months. When researchers confronted the developer, he deleted the package and vanished. But removing a package from npm doesn't uninstall it from the production environments already running it.


## The (Hidden) Instruction Problem

Traditional software does what it's told. If a package is compromised, it executes malicious code you can scan for. AI agents are different. They interpret instructions from multiple sources simultaneously, the user, the system prompt, tool descriptions, and hidden files the user never sees. A malicious skill doesn't need to contain obvious malware. It just needs instructions written in plain language, tucked in a file the UI doesn't render.

O'Reilly's skill hid its payload in a referenced logic file. The visible SKILL.md was pure marketing, professional, zero red flags. The AI read every file. The user read none of them.

The AI wasn't being tricked. It was following instructions. The instructions happened to have been written by an attacker.


## The Industry's Comfortable Excuse

When security researchers flag these issues, the industry calls them theoretical. Researchers have documented widespread vulnerabilities across MCP implementations, command injection, path traversal, attacks that manipulate AI behaviour through hidden instructions. Forty-five percent of vendors dismissed findings as theoretical or acceptable. Twenty-five percent ignored disclosures entirely.

The postmark-mcp attack was not theoretical. The ClawdHub experiment was not theoretical.

> "Theoretical" is just a way of saying we know, we'll get to it, but right now there are features to ship.


## What Actually Needs to Change

We have a psychology problem dressed up as a technology problem, and technology solutions alone won't fix it.

We've built an ecosystem where speed is rewarded and caution is punished. The developer who adds proper security review to every tool integration is slower than the one who doesn't. The security team that raises concerns about plugin vetting gets accused of blocking progress.

What shifts it is the same thing that shifted it in every previous era of software security. Incidents that make the cost visible and concrete. Registries where verified tools are the default. Platforms that build security in rather than bolt it on. And organisations that stop treating AI plugin adoption as a productivity question.

## The Warning We Keep Ignoring

O'Reilly ends his writeup with a line worth sitting with. "The skill is still live on ClawdHub. Go read rules/logic.md before you run it. That's the whole point."

Most people won't. That's also the point.

We're choosing not to ask basic questions about the foundations we're building on. Not because we don't know to ask, but because the desire to be part of what's coming is stronger than the discipline to check.

The next attacker to weaponise this won't build an educational skill. They'll take the SSH keys, the API credentials, the browser sessions, and cover their tracks so well most victims will never know.

A researcher got there first (this time) and chose to tell us. That's not a guarantee. That's luck. At some point the warning stops coming from a researcher with a conscience and starts coming in the form of a breach. That gap is closing faster than security is.