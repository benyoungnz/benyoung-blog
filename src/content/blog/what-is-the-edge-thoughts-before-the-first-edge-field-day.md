---
title: 'What is Edge Computing, thoughts before the first Edge Field Day' 
description: 'I sit here in the airport waiting for the flight over to the very first Edge
Field Day in San Francisco and could not help put together some thoughts '
heroImage: '/content/images/2023/02/benyoung_a_global_network_of_sensors_interconnected_f304e86c-4139-4923-9112-1d9f6441d72e.png'
slug: 'what-is-the-edge-thoughts-before-the-first-edge-field-day'
pubDate: '2023-02-21T05:57:43.000Z'
tags: ["edge", "techfieldday"] 
categories: ['TFD']
author: ["ben"]
---

I sit here in the airport waiting for the flight over to the very first Edge Field Day in San Francisco and could not help put together some thoughts around edge and what I am hoping to discuss in depth not only at the live streamed events but also over dinner, in the hotel lobby or at the water cooler.

What is Edge? For me anyway, it is about bringing the computation and data storage closer to the location where it is needed, let's be clear here a big part of this is servers but the reality is we are also talking about devices like sensors and other such devices - it is not a one sized fits all approach and different use cases may call for more advanced or bigger deployments than others - importantly however edge compute looks like it is here to stay.

The demand for real-time data processing and analytics is ever increasing, edge computing can help us as a society meet that demand by providing low latency and high-speed processing for workloads that require it. Everything from washing machines to golf bags are becoming internet-enabled and generate large amounts of data, edge computing can help process that data more efficiently and effectively.

### Why edge computing?

- **Low latency **- for latency sensitive applications or equipment by processing data closer to the source, we can reduce the latency or delay that can occur when sending data to a remote location
- **Improved reliability** - this is a tricky one but there could be an argument for each side but for certain locations or where networks are patchy or unreliable by reducing dependence on a central data center reliability back to these central services should increase. (provided you feed and water your edge cluster correctly!)
- **Reduced bandwidth** - By processing data locally, edge computing can reduce the amount of data that needs to be sent over the network at the very least during peak times and trickle backups or full data sets during periods of inactivity
- **Privacy or sensitivity** - Data processing at the edge can help ensure data privacy and security since sensitive data doesn't have to be sent to a remote server for processing - think medical, government, financial or other highly regulated industries

### What industries could benefit from edge computing?

1. **Manufacturing -** A fairly obvious one but, in manufacturing, real-time analytics can be used to optimise production processes, reduce downtime, benefits to the environment by helping reduce waste and my favourite - increase safety for workers. By deploying sensors and computing resources at the edge, manufacturers can capture and process data in real-time to to help make decisions.
2. **Health Industry** - The scope here is massive not only for in big facilities like hospitals or clinics but with the explosion of fitness and health wearable devices - Real-time data processing and analytics can help monitor patient health and detect potential health issues. 
3. **Retail -** In retail, real-time data processing and analytics can be used to personalise and optimise the shopping experience, help with inventory, and improve supply chain or similar. By giving retail outlets access to data in real-time,  data-driven decisions on pricing, product placement, recommendations to consumers, and promotions become a much easier and calculated decision

### What about machine learning?

Artificial intelligence is another key technology that can benefit and sit very nicely out at the edge. By deploying machine learning at the edge, businesses can process data and make predictions more quickly and efficiently, especially when there are large data sets are involved, or really any of the points above about latency, sensitivity.

### How important is Infrastructure as Code (IaC)?

What we are talking about here is automated deployment via tooling and configuration files, typically using tools like Terraform, Ansible, or CloudFormation. IaC is critical for managing what can be a complex set of infrastructure requirements, especially true of the edge.

Edge computing involves deploying and managing a infrastructure across various locations, often nationally if not globally. This can be very challenging for infrastructure teams to manage manually. By using IaC, we automate the deployment and management of edge computing resources - making it easier to maintain consistency and updates to these resources.

The two main aspects I can see IaC playing a role in edge computing is

1. **Consistency** -  across different edge locations by defining infrastructure configurations as code. This makes it easier to manage multiple edge locations, reducing the risk of human error or configuration drift across potentially hundreds if not thousands of edge sites.
2. **Speed** -  By automating infrastructure deployment and management, IaC can help accelerate how quickly we can deploy edge compute. This can be particularly important when we need to quickly deploy and test new edge computing use cases.

