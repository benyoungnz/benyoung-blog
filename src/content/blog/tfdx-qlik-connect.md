---
title: 'TFDx - Qlik Connect' 
description: 'Mary - VP AI Analytics
Accelerating adoption

 * Data from ALL/lots of sources
 * Trust in the data, make sure its data we can trust, where it came fr'
heroImage: ''
slug: 'tfdx-qlik-connect'
pubDate: '1970-01-01T00:00:00.000Z'
draft: true
categories: ['veeam']
author: ["ben"]
---

Mary - VP AI Analytics
Accelerating adoption

- Data from ALL/lots of sources
- Trust in the data, make sure its data we can trust, where it came from
- Elevate AI and Analytics to help drive business forward, not simple graphs anymore. With these new announcements.
- Help customers bring their AI strategy to life "Qlik Staige" - Trusted foundation, turnkey ai solutions, self service AI

Nick - Head of AI
Three big announcements

- Data is at the centre of the foundation, 96% of orgs dont feel like their data is "AI ready". Qlik Talend Cloud is modern code/no code platform to create a trusted foundation for AI analytics and operations
- 80% of data is unstructured in organisations, 70% of ors havent done anything in this space, 2/3 of these orgs expect to want to do something with this daya in next 2 years
- "Qlik Answers" - Gen-AI from unstructured content 
- AutoML - 250k ai models have now been built, 11k are in production , the gap is shrinking 
- AutoML going to become easier and more efficient

Dan Potter - VP Product Marketing

- Qlik Talend == data Trust, move/transform, access

AI-Assisted data engineering

Talend Data Integrations

- Very easy to add data connections to data sources
- 70 today, 100 very shortly - massive investment in this space
- AI/ML built in, they dont trust the source schema, it's analyzed, then optimised (i.e removed a bunch of blank fields you dont use)
- Transforms are completed, entity resolutions, where nested arrays on your models
- Brings together 10-20 tools into one integrated platform, much more efficient to mantain and manage
- LLM query to generate SQL, bedrock backed, Claude? 

!! Rag Pipeline

- Create a "document", model defined, json payload (structured data from qlik data elements)
- Deliver data to vectorstore of choosing or qlik answers
- CDC change data capture, detect changes at source
- Current data source for unstrucuted is s3 file sources, will be extended to even run on prem via a gateway appliance, allow the customer to control the dataplane 

Trusted data foundation

- Improve model outcomes with "Trust Score" for AI
- Trust Score for AI== 
 Make sure data is **diverse** (siloed data creates bias results)
Data is **secure** (data will have pii, financial etc, make sure machines are not leaking data. Mapping data and masking, access management and role mapping)
**Timeliness**, Make sure data is not stale, refresh vectorstores consistenctly, ensure output is accurate
**Consumability**, more targets to consume data from
**Accuraacy**, ai is only as good as the data. When data comes in, check on the quality, dedupes, outliers removed  etc, build in quality checks OVER the data and observe things like data flowing correctly
**Discoverability** - make sure data scientists can discover the data, has business metadata around the data to people know where data is stored and find and understand what data provide what context
- Trust score uses all 6 dimensions above

Trust score is a framework, drag component into the studio as a building block

There is a trust score for AI dashboard, shows history over time per component, you also see the trust history over time.

Data products. Data to outcomes. Data producers work with data consumers.

Data products bridge the gap between producers and comsumers

Data products are created in domains like sales, mareting, operations. each domain owns their own data, responsible for packaging, trust etc. 

Curated, reusable, iterative, secure.

Qlik are announcing data product support to manage their products. They are also announcing a data product marketplace.

GenAI in the enterprise

LLMs are != enterprise grade gen ai solution

Enterprise grade llm is llms + contextual enterprise data. (RAG)

Every search bar in the next 3-5 years will have some form of RAG behind the scenes

Qlik answers is plug and play genai assistant. 

!! people spend around 20% of their time looking for information in unstructured data approx 1/day a week

Important to return source docs references

Individual answer engines based on data type/department vs one big engine. Yield better results. 

Ideally a unified system to interact with these copilots, not having to move between copilots. 

Flow is, create bot, import view existing files (imported to qlik catalog) or data connectors like sharepoint. 

Data is indexed, chunked, uses best practice/best results as defaults.

Vector matches are retrieved, then reranked to ensure theyre the best chunks - as the best chunk may be at the bottom of the first list.

AutoML Improvements --

handles heavy lifting, analyses data, i.e removes columns with high level of cardinality. Strips out noisy data, misses values etc. When you hit execute it gives you the best possible model.

Licensed per deployed model

After training model it will tell you what it did, i.e dropped data because of X, gives summary of accuracy of what features move the acuracy lever in the dataset

Models can be scheduled to apply predicitions and store these, or, host a realtime api that can be embedded. 

