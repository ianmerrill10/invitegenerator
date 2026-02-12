# LM Studio Expert Guide for InviteGenerator

> Complete technical reference for using LM Studio with this project.
> Last Updated: December 21, 2025

---

## Quick Start

```bash
# Check if LM Studio is running
curl http://localhost:1234/v1/models

# Test a completion
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen2.5-coder-7b-instruct", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## Table of Contents

1. [Connection Details](#connection-details)
2. [Available Models](#available-models)
3. [API Endpoints](#api-endpoints)
4. [Request Parameters](#request-parameters)
5. [Response Formats](#response-formats)
6. [Streaming](#streaming)
7. [Embeddings](#embeddings)
8. [Best Practices for InviteGenerator](#best-practices)
9. [Model Selection Guide](#model-selection-guide)
10. [Integration Patterns](#integration-patterns)

---

## Connection Details

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:1234` |
| API Version | `/v1` |
| Full Base | `http://localhost:1234/v1` |
| Auth | None required (local) |
| Protocol | HTTP (not HTTPS for local) |

---

## Available Models (Current Installation)

| Model ID | Purpose | Size | Best For |
|----------|---------|------|----------|
| `qwen2.5-coder-7b-instruct` | Code generation | 7B | TypeScript/React code |
| `qwen/qwen3-coder-30b` | Advanced coding | 30B | Complex refactoring |
| `mistralai/codestral-22b-v0.1` | Code generation | 22B | Full-stack development |
| `deepseek-r1-distill-qwen-14b` | Reasoning | 14B | Planning, architecture |
| `bartowski/deepseek-coder-v2-lite-instruct` | Code | 16B | Code completion |
| `lmstudio-community/deepseek-coder-v2-lite-instruct` | Code | 16B | Code completion |
| `codegemma-7b-it` | Code | 7B | Quick code fixes |
| `sqlcoder-7b-2` | SQL | 7B | Database queries |
| `phi-3.5-mini-instruct` | General | 3.8B | Fast simple tasks |
| `mistralai/mistral-7b-instruct-v0.3` | General | 7B | Content generation |
| `google/gemma-3-4b` | General | 4B | Quick responses |
| `qwen/qwen2.5-vl-7b` | Vision | 7B | Image analysis |
| `text-embedding-nomic-embed-text-v1.5` | Embeddings | - | Semantic search |

---

## API Endpoints

### GET /v1/models
List all available models.

```bash
curl http://localhost:1234/v1/models
```

**Response:**
```json
{
  "data": [
    {"id": "model-id", "object": "model", "owned_by": "organization_owner"}
  ],
  "object": "list"
}
```

### POST /v1/chat/completions
Generate chat completions (recommended for most uses).

```bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder-7b-instruct",
    "messages": [
      {"role": "system", "content": "You are a helpful coding assistant."},
      {"role": "user", "content": "Write a TypeScript function to validate email."}
    ],
    "temperature": 0.7,
    "max_tokens": 2000
  }'
```

### POST /v1/completions
Generate text completions (legacy, for prompt-based generation).

```bash
curl http://localhost:1234/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi-3.5-mini-instruct",
    "prompt": "Complete this code: function add(a, b) {",
    "max_tokens": 100
  }'
```

### POST /v1/embeddings
Generate text embeddings for semantic search.

```bash
curl http://localhost:1234/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-nomic-embed-text-v1.5",
    "input": "Wedding invitation template"
  }'
```

---

## Request Parameters

### Core Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | string | required | Model ID to use |
| `messages` | array | required | Chat history array |
| `temperature` | float | 0.7 | Randomness (0.0-2.0) |
| `max_tokens` | int | model max | Max output tokens |
| `top_p` | float | 1.0 | Nucleus sampling |
| `stream` | bool | false | Enable streaming |
| `stop` | string/array | null | Stop sequences |

### Advanced Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `presence_penalty` | float | 0 | Penalize repeated topics (-2.0 to 2.0) |
| `frequency_penalty` | float | 0 | Penalize repeated tokens (-2.0 to 2.0) |
| `top_k` | int | 40 | Top-k sampling |
| `repeat_penalty` | float | 1.1 | Repetition penalty |
| `seed` | int | null | Random seed for reproducibility |

### Message Object Structure

```json
{
  "role": "system" | "user" | "assistant",
  "content": "Message text here"
}
```

---

## Response Formats

### Chat Completion Response

```json
{
  "id": "chatcmpl-xxxxxx",
  "object": "chat.completion",
  "created": 1766362340,
  "model": "qwen2.5-coder-7b-instruct",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Generated response here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  }
}
```

### Finish Reasons

| Reason | Meaning |
|--------|---------|
| `stop` | Natural completion or stop sequence |
| `length` | Hit max_tokens limit |
| `content_filter` | Content filtered |

---

## Streaming

Enable real-time token streaming for better UX:

```bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder-7b-instruct",
    "messages": [{"role": "user", "content": "Write a poem"}],
    "stream": true
  }'
```

**Stream Response Format (SSE):**
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" World"}}]}
data: [DONE]
```

---

## Embeddings

Use the embedding model for semantic search:

```javascript
// Node.js example
const response = await fetch('http://localhost:1234/v1/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'text-embedding-nomic-embed-text-v1.5',
    input: 'Wedding invitation with floral design'
  })
});

const { data } = await response.json();
const embedding = data[0].embedding; // Array of floats
```

---

## Best Practices for InviteGenerator

### 1. Model Selection by Task

| Task | Recommended Model | Temperature |
|------|-------------------|-------------|
| Generate invitation text | mistral-7b-instruct | 0.8 |
| Write TypeScript code | qwen2.5-coder-7b-instruct | 0.3 |
| Complex refactoring | qwen/qwen3-coder-30b | 0.2 |
| SQL queries | sqlcoder-7b-2 | 0.1 |
| Template descriptions | phi-3.5-mini-instruct | 0.7 |
| Architecture planning | deepseek-r1-distill-qwen-14b | 0.4 |
| Image template search | text-embedding-nomic-embed-text-v1.5 | N/A |

### 2. System Prompts for InviteGenerator

**For Code Generation:**
```
You are an expert Next.js 14 developer working on InviteGenerator, a digital invitation SaaS.
Tech stack: TypeScript, App Router, AWS (Cognito, DynamoDB, S3, Bedrock), Stripe, Tailwind CSS, Radix UI.
Follow existing patterns in the codebase. Write clean, type-safe code.
```

**For Content Generation:**
```
You are a creative copywriter for InviteGenerator, an AI-powered invitation platform.
Write engaging, warm, and professional content for digital invitations.
Tone: Elegant yet approachable. Avoid overly formal language.
```

**For Template Metadata:**
```
Generate metadata for invitation templates. Include:
- Descriptive title (3-5 words)
- Category (wedding, birthday, baby_shower, etc.)
- Style (modern, elegant, rustic, minimalist, playful)
- Color palette
- Keywords for search
```

### 3. Batch Processing Pattern

```javascript
// Process multiple items efficiently
async function batchGenerate(items, model, systemPrompt) {
  const results = [];
  for (const item of items) {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: item.prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    const data = await response.json();
    results.push({
      input: item,
      output: data.choices[0].message.content
    });
  }
  return results;
}
```

---

## Model Selection Guide

### For This Project (InviteGenerator)

**Primary Coding Model:** `qwen2.5-coder-7b-instruct`
- Fast, accurate TypeScript/React
- Good at following patterns

**Heavy Lifting:** `qwen/qwen3-coder-30b`
- Complex architectural changes
- Large refactors

**Quick Tasks:** `phi-3.5-mini-instruct`
- Simple completions
- Content generation
- Fast responses

**Database Work:** `sqlcoder-7b-2`
- DynamoDB query design
- Data modeling

**Semantic Search:** `text-embedding-nomic-embed-text-v1.5`
- Template search
- Content similarity

---

## Integration Patterns

### 1. Next.js API Route Integration

```typescript
// app/api/ai/local/route.ts
import { NextRequest, NextResponse } from 'next/server';

const LM_STUDIO_URL = 'http://localhost:1234/v1';

export async function POST(req: NextRequest) {
  const { prompt, model = 'qwen2.5-coder-7b-instruct' } = await req.json();

  const response = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  const data = await response.json();
  return NextResponse.json({ result: data.choices[0].message.content });
}
```

### 2. Template Generation Script

```typescript
// scripts/generate-templates-local.ts
const generateTemplateMetadata = async (imageUrl: string) => {
  // Use vision model to analyze template
  const response = await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen/qwen2.5-vl-7b',
      messages: [{
        role: 'user',
        content: `Analyze this invitation template image and provide:
        1. Category (wedding/birthday/baby_shower/etc)
        2. Style (modern/elegant/rustic/etc)
        3. Color palette
        4. Suggested title
        5. Keywords for search

        Image: ${imageUrl}`
      }]
    })
  });
  return response.json();
};
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure LM Studio is running with server enabled |
| Model not found | Check model is loaded in LM Studio |
| Slow responses | Try smaller model or reduce max_tokens |
| Out of memory | Unload unused models in LM Studio |
| Truncated output | Increase max_tokens parameter |

---

## Performance Tips

1. **Keep models loaded** - Don't switch models frequently
2. **Use streaming** - Better UX for long responses
3. **Batch similar requests** - Group by model
4. **Set reasonable max_tokens** - Don't request more than needed
5. **Use temperature wisely** - Lower for code, higher for creative

---

*This guide is maintained as part of the InviteGenerator project documentation.*
