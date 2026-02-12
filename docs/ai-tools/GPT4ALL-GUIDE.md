# GPT4All Configuration Guide

> Complete guide for using GPT4All locally on this PC.
> Last Updated: 2025-12-21

---

## Installation Location

| Item | Path |
|------|------|
| Installation | `C:\Users\ianme\gpt4all` |
| Executable | `C:\Users\ianme\gpt4all\bin\chat.exe` |
| Data Directory | `C:\Users\ianme\AppData\Local\nomic.ai\GPT4All` |
| Config File | `C:\Users\ianme\AppData\Roaming\nomic.ai\GPT4All.ini` |
| Models Cache | `C:\Users\ianme\AppData\Local\nomic.ai\GPT4All\cache` |

---

## API Server Configuration

### Enabling the API Server

1. Open GPT4All application
2. Go to **Settings** (gear icon)
3. Navigate to **Application > Advanced**
4. Check **"Enable Local API Server"**
5. Note the port (default: **4891**)
6. Restart GPT4All

### API Details

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:4891/v1` |
| Protocol | HTTP (not HTTPS) |
| Host | localhost / 127.0.0.1 only |
| Compatibility | OpenAI API compatible |

### API Endpoints

```
GET  /v1/models              - List available models
POST /v1/chat/completions    - Chat completions
POST /v1/completions         - Text completions
POST /v1/embeddings          - Generate embeddings
```

### Example API Call

```bash
curl http://localhost:4891/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Llama 3.2 3B Instruct",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

---

## Recommended Models for InviteGenerator

### Tier 1: Primary Models (Install First)

| Model | Size | RAM | Best For |
|-------|------|-----|----------|
| **DeepSeek-R1-Distill-Qwen-14B** | 8.5GB | 16GB | Complex reasoning, planning |
| **DeepSeek-R1-Distill-Qwen-7B** | 4.4GB | 8GB | Reasoning (lighter) |
| **Llama 3.2 3B Instruct** | 1.9GB | 4GB | Fast general tasks |
| **Qwen2.5-Coder-7B** | 4.4GB | 8GB | Code generation with reasoning |

### Tier 2: Specialized Models

| Model | Size | Best For |
|-------|------|----------|
| **Llama 3 8B Instruct** | 4.7GB | General chat, content |
| **DeepSeek-R1-Distill-Llama-8B** | 4.7GB | Reasoning with Llama base |
| **DeepSeek-R1-Distill-Qwen-1.5B** | 1.1GB | Ultra-fast simple tasks |

### Tier 3: Large Models (If RAM Allows)

| Model | Size | RAM | Notes |
|-------|------|-----|-------|
| DeepSeek-R1-Distill-Qwen-14B | 8.5GB | 16GB | Best reasoning quality |
| Mistral 7B | ~4GB | 8GB | Good all-rounder |

---

## VS Code Integration

### Method 1: API Server (Recommended)

1. Enable GPT4All API Server (see above)
2. Install VS Code extension: **Continue** or **FlexiGPT**
3. Configure extension:
   - API Type: "OpenAI-compatible"
   - Base URL: `http://localhost:4891/v1`
   - Model: Match the loaded model name

### Method 2: Python Bindings

```bash
pip install gpt4all
```

```python
from gpt4all import GPT4All

model = GPT4All("Llama-3.2-3B-Instruct-Q4_0.gguf")

with model.chat_session():
    response = model.generate(
        prompt="Write a TypeScript function",
        temp=0.3
    )
    print(response)
```

---

## Comparison: GPT4All vs LM Studio

| Feature | GPT4All | LM Studio |
|---------|---------|-----------|
| Default Port | 4891 | 1234 |
| API Compatibility | OpenAI | OpenAI |
| GUI | Yes | Yes |
| CLI | Limited | Yes (`lms.exe`) |
| Model Management | In-app | In-app + CLI |
| Reasoning Models | Built-in | Manual download |
| GPU Acceleration | Auto | Manual config |

### When to Use Each

| Scenario | Use |
|----------|-----|
| DeepSeek R1 reasoning tasks | GPT4All |
| qwen3-coder-30b (primary coding) | LM Studio |
| Quick general tasks | GPT4All (smaller models) |
| Complex code refactoring | LM Studio |
| Planning/architecture | GPT4All (DeepSeek R1) |

---

## Model Download Instructions

### Via GPT4All GUI

1. Open GPT4All
2. Click **"Download Models"** or browse model list
3. Click download icon next to desired model
4. Wait for download to complete
5. Click model to load it

### Via Python

```python
from gpt4all import GPT4All

# This will download if not present
model = GPT4All("Llama-3.2-3B-Instruct-Q4_0.gguf")
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API not responding | Enable API Server in Settings |
| Model not loading | Check RAM requirements |
| Slow responses | Use smaller model or check GPU |
| Connection refused | Verify port 4891 is correct |
| Model download fails | Check internet connection |

---

## Best Practices

1. **Keep one model loaded** - Switching models is slow
2. **Use smaller models for quick tasks** - 3B models are very fast
3. **Use DeepSeek R1 for reasoning** - Specifically tuned for complex thinking
4. **Close when not needed** - Frees GPU/RAM for other tasks
5. **Enable API server** - Required for programmatic access

---

## Sources

- [GPT4All Official Docs](https://docs.gpt4all.io/)
- [GPT4All API Server](https://docs.gpt4all.io/gpt4all_api_server/home.html)
- [GitHub Wiki - Local API Server](https://github.com/nomic-ai/gpt4all/wiki/Local-API-Server)
- [Nomic AI GPT4All](https://www.nomic.ai/gpt4all)

---

*This guide is specific to this PC's installation.*
