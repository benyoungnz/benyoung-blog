---
title: "Powering Custom Workflows with the Qlik Answers API"
description: "Embed trusted, AI-powered answers into any application. See how the Qlik Answers API can power your custom business workflows"
heroImage: "/content/images/2025/enterprise-rag-your-way.jpg"
slug: "powering-custom-workflows-with-the-qlik-answers-api"
pubDate: "2025-10-10T07:43:42.137Z"
tags: ["qlik", "ai"] 
categories: ['TFD']
author: ["ben"]
---

While a powerful, built-in chat interface is a great starting point, the true potential of an enterprise knowledge system is realized when it meets users where they already work. Business doesn't happen in a single application; it flows through Slack channels, Microsoft Teams, custom internal portals, and bespoke mobile apps. Forcing users to context-switch to a separate tool just to ask a question is a recipe for low adoption.

Qlik provides two methods for bringing these assistants into your own applications. For web-based integrations, **`qlik-embed`** offers a straightforward way to drop the complete, pre-built Qlik Answers experience into a webpage with a single HTML tag:

```html
<qlik-embed
  ui="ai/assistant"
  assistant-id="<assistant-id>"
></qlik-embed>
```

But for deeper, more bespoke integrations that go beyond a simple embed, there's the Qlik Answers **Assistants API**. The API provides the headless engine needed to build entirely custom experiences, powering workflows in applications where a web component won't fit—like a chat bot.

To demonstrate the power and flexibility of the API, I built a practical example that a simple embed couldn't handle: a fully functional Telegram chatbot. This serves as a overview for how the Assistants API unlocks custom solutions that are deeply integrated into your users' existing workflows.

### The API

The beauty of the Qlik Answers platform is that it has already solved the hard problems. My job wasn't to build a RAG pipeline; it was simply to *consume* the results through a clean, well-designed API. The entire interaction boils down to two straightforward API calls.

#### Step 1: Create a Conversation Thread

First, my application needs to tell Qlik that a new conversation is starting. I make a single, simple API call.

**API Request:**

```http
POST /api/v1/assistants/{assistantId}/threads
Authorization: Bearer {apiKey}

{
  "name": "Conversation for: {userQuestion|userName}"
}
```

The platform handles the backend complexity and returns a unique `threadId`. This ID now represents our isolated, contextual conversation.

#### Step 2: Ask the Question and Stream the Answer

With the `threadId`, my application can now ask the user's question. I send the prompt to the `stream` endpoint, which is where the magic happens.

**API Request:**

```http
POST /api/v1/assistants/{assistantId}/threads/{threadId}/actions/stream
Authorization: Bearer {apiKey}

{
  "input": {
    "prompt": "{userQuestion}",
    "promptType": "thread",
    "includeText": true
  }
}
```

This one API call triggers the RAG pipeline that the Qlik platform manages: retrieving relevant chunks from the vector database, reranking them for relevance, and feeding them to the LLM for an answer. My bot doesn't need to know anything about the underlying models or infrastructure. It just needs to handle the response.


### Answers Response

The API returns a streaming response, which is ideal for a chat interface and what we are used to seeing where the words started streaming onto the interface in realtime - because the destination in my case is the Telegram client, I simply wait for the response to complete then send the entire answer.

1.  **Output Chunks:** Small objects containing parts of the answer, allowing the text to be displayed progressively.
    ```json
    {"output": "The G20 Finance Ministers"}
    {"output": " met in São Paulo, Brazil"}
    ```
2.  **Source Chunk:** A final, larger object containing rich metadata on every source document used to generate the answer.
    ```json
    {
      "sources": [
        {
          "documentId": "483d4755-e911-43e5-8c0c-c39e38467237",
          "source": "1st G20 Finance Ministers Meeting_28022024.pdf",
          ...
        }
      ]
    }
    ```


### Integrated Into Telegram

The final product is simple, by design as we just wanted to showcase the power of the API to bring answers from the assistant directly in the user's workflow.

![Qlik Answers Indexing Status](/content/images/2025/qlik-answers-in-mobile-application.jpg)

> View a video on YouTube [youtube.com/shorts/T02Dj9Y5cFM](https://www.youtube.com/shorts/T02Dj9Y5cFM)

#### Text Example

> **User:** "What did the G20 discuss in Brazil?"
>
> **Bot:** "The G20 Finance Ministers met in São Paulo, Brazil on February 28-29, 2024. They discussed the global economic outlook, focusing on risks like inflation and geopolitical tensions, and emphasized the need for well-calibrated monetary, fiscal, and structural policies."
>
> **📚 Sources (5):**
>
> 1.  1st G20 Finance Ministers Meeting 28022024.pdf
> 2.  Chair's Statement of the Brazilian G20 Presidency 23072024.pdf
> 3.  Chair Statement Employment WG 24072024.pdf

The API provides all the source data needed to show the user exactly where the information came from, building the trust required for production adoption.

While this example used Telegram, the underlying takeaway is about the API's flexibility. The same simple integration pattern can be used to bring Qlik Answers into any application—a AI agent, a custom web portal, or an existing workflow.