---
title: 'InfluxDB  max-series-per-database limit exceeded' 
description: 'If you are writing a bunch of data you may come across this error in your
InfluxDB logs... or... notice via your visualisation tools that data is miss'
heroImage: '/content/images/2022/04/influx-db-max-series.jpg'
slug: 'influxdb-max-series-per-database-limit-exceeded'
pubDate: '2022-04-21T21:50:46.000Z'
tags: ["influxdb"] 
categories: ['veeam']
author: ["ben"]
---

If you are writing a bunch of data you may come across this error in your InfluxDB logs... or... notice via your visualisation tools that data is missing.

Well the latter occurred to me, noticed some gaps in Grafana starting to appear in our vSphere monitoring which. Jumping into the docker logs and noticed messages like the below on the Telegraf output log

> partial write: max-series-per-database limit exceeded: (1000000) 

Easy fix, open up my docker file and inject the following environment variable

**INFLUXDB_DATA_MAX_SERIES_PER_DATABASE: 0**

So it looks like this 
![](/content/images/2022/04/image-34.png)
*(if you are not via a container then you can add it to your /etc/default/influxdb file)*

This value is configurable, **0 means unlimited** so if you wanted to you could increase to a value you were comfortable with.

Official word from the docs

> Change the setting to 0 to allow an unlimited number of series per database. If a point causes the number of series in a database to exceed max-series-per-database, InfluxDB will not write the point, and it returns a 500 with the following error

After making this change and restarting the container environment a quick follow of the logs then shows that the data is being inserted into the InfluxDB once again from Telegraf
![](/content/images/2022/04/image-35.png)

