---
title: 'Macbook toolset build' 
description: 'This is really a living document for myself that will continue to be updated as
I add things to my mbp. I wish I had done this the last time I set one'
heroImage: ''
slug: 'macbook-build'
pubDate: '2021-07-04T22:58:37.000Z'
categories: ['random']
author: ["ben"]
---

This is really a living document for myself that will continue to be updated as I add things to my mbp. I wish I had done this the last time I set one up (it was my intention).

I am actually backing up my MPB using Veeam Agent for Mac should the worst happen data wise but being able to quickly access the tool list/install methods make new builds a breeze. One day if i get the energy ill try script a lot of it.

In (mostly) no particular order

### Homebrew Install

This little tool allows me to quickly deploy most of the tools here on out thanks to the great community. Check them out on [brew.sh](https://brew.sh)

```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Communications

### Slack

[https://slack.com/intl/en-nz/downloads/mac?geocode=en-nz](https://slack.com/intl/en-nz/downloads/mac?geocode=en-nz)

### Office

Install office suite such as Outlook, Teams, Word, Excel etc via [office.com](https://office.com)

### Signal

Then link to mobile via mobile application

```
brew install --cask signal
```

## General Tools

### Remote Desktop Manager

A lot on my development environment is still on a windows virtual desktop and i need access to a lot of other servers as part of my role. I am using remote desktop manager for mac.

```
brew install --cask remote-desktop-manager-free
```

### iTerm2

Go to terminal client

```
brew install --cask iterm2
```

### Forticlient VPN

Remote access to various locations including dialing into home when away.

```
brew install --cask forticlient-vpn
```

> also need to run the installer (as at writing this) /usr/local/Caskroom/forticlient-vpn/6.4/FortiClientUpdate.app


### htop

Interactive process monitor

```
brew install htop
```

## Developer Tools

### Visual Studio Code

My go to for all editing/coding requirements when working locally. [https://code.visualstudio.com/download](https://code.visualstudio.com/download)

### Github Desktop

Don't judge me ;p Love me a bit of GUI from time to time.

```
brew install --cask github
```

### Postman

Used for testing out API's

```
brew install --cask postman
```

## Other

### Adobe Creative Cloud

I use a fair bit of this suite, Photoshop, Illustrator Lightroom, Premier Pro mainly

[https://www.adobe.com/nz/creativecloud.html](https://www.adobe.com/nz/creativecloud.html)
















