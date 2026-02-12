# Recommended Models for InviteGenerator

> Model selection guide and installation recommendations.
> Generated: 2025-12-21 19:25:00 EST

---

## Currently Installed Models

| Model | Size | Purpose | Status |
|-------|------|---------|--------|
| qwen2.5-coder-7b-instruct | 7B | TypeScript/React coding | Installed |
| qwen/qwen3-coder-30b | 30B | Complex coding tasks | Installed |
| mistralai/codestral-22b-v0.1 | 22B | Full-stack development | Installed |
| deepseek-r1-distill-qwen-14b | 14B | Reasoning/planning | Installed |
| bartowski/deepseek-coder-v2-lite-instruct | 16B | Code completion | Installed |
| lmstudio-community/deepseek-coder-v2-lite-instruct | 16B | Code completion | Installed |
| codegemma-7b-it | 7B | Quick code fixes | Installed |
| sqlcoder-7b-2 | 7B | Database queries | Installed |
| phi-3.5-mini-instruct | 3.8B | Fast simple tasks | Installed |
| mistralai/mistral-7b-instruct-v0.3 | 7B | Content generation | Installed |
| google/gemma-3-4b | 4B | Quick responses | Installed |
| qwen/qwen2.5-vl-7b | 7B | Vision/image analysis | Installed |
| text-embedding-nomic-embed-text-v1.5 | - | Embeddings/search | Installed |

---

## Models to Install (Recommended)

### High Priority (Install These First)

#### 1. DeepSeek Coder V2 (Full Version)
- **Model**: `deepseek-ai/deepseek-coder-v2-instruct`
- **Size**: 236B (quantized: ~16B-64B)
- **Why**: Best-in-class coding performance
- **Use for**: Complex refactoring, architecture design

#### 2. Qwen2.5-14B-Instruct
- **Model**: `Qwen/Qwen2.5-14B-Instruct`
- **Size**: 14B
- **Why**: Excellent balance of speed and capability
- **Use for**: General purpose, documentation, content

#### 3. Llama 3.1 8B Instruct
- **Model**: `meta-llama/Llama-3.1-8B-Instruct`
- **Size**: 8B
- **Why**: Strong general reasoning
- **Use for**: Planning, analysis, writing

#### 4. CodeLlama 13B Instruct
- **Model**: `codellama/CodeLlama-13b-Instruct-hf`
- **Size**: 13B
- **Why**: Meta's coding-focused model
- **Use for**: Code generation, debugging

### Medium Priority

#### 5. Mistral Nemo 12B
- **Model**: `mistralai/Mistral-Nemo-Instruct-2407`
- **Size**: 12B
- **Why**: Good for structured outputs (JSON)
- **Use for**: API responses, data transformation

#### 6. Granite Code 8B
- **Model**: `ibm-granite/granite-8b-code-instruct`
- **Size**: 8B
- **Why**: Enterprise-grade coding model
- **Use for**: Code review, security analysis

#### 7. StarCoder2 7B
- **Model**: `bigcode/starcoder2-7b`
- **Size**: 7B
- **Why**: Trained on code, good for completions
- **Use for**: Code completion, autocomplete

### Specialized Models

#### 8. WizardCoder 15B
- **Model**: `WizardLMTeam/WizardCoder-15B-V1.0`
- **Size**: 15B
- **Why**: High-quality code generation
- **Use for**: Complex algorithms

#### 9. Phi-3-Vision-128k
- **Model**: `microsoft/Phi-3-vision-128k-instruct`
- **Size**: 4.2B
- **Why**: Vision + language
- **Use for**: Template image analysis

#### 10. Nomic Embed Text V1.5
- **Model**: `nomic-ai/nomic-embed-text-v1.5`
- **Size**: ~140M
- **Why**: High-quality embeddings
- **Use for**: Semantic search (already installed)

---

## Model Selection by Task

### For This Project (InviteGenerator)

| Task | Primary Model | Fallback Model |
|------|---------------|----------------|
| TypeScript/React | qwen2.5-coder-7b-instruct | codegemma-7b-it |
| Complex Refactoring | qwen/qwen3-coder-30b | codestral-22b |
| SQL/DynamoDB | sqlcoder-7b-2 | qwen2.5-coder-7b |
| Content Writing | mistral-7b-instruct | phi-3.5-mini |
| Documentation | phi-3.5-mini-instruct | mistral-7b |
| Planning/Architecture | deepseek-r1-distill-qwen-14b | qwen3-coder-30b |
| Image Analysis | qwen/qwen2.5-vl-7b | (no fallback) |
| Semantic Search | nomic-embed-text-v1.5 | (no fallback) |
| Quick Tasks | google/gemma-3-4b | phi-3.5-mini |

---

## Installation Instructions

### Via LM Studio GUI

1. Open LM Studio
2. Go to "Discover" tab
3. Search for model name
4. Click "Download"
5. Select quantization (Q4_K_M recommended for balance)

### Quantization Guide

| Quantization | VRAM Needed | Quality | Speed |
|--------------|-------------|---------|-------|
| Q2_K | Lowest | Poor | Fastest |
| Q4_K_M | Low-Medium | Good | Fast |
| Q5_K_M | Medium | Very Good | Medium |
| Q6_K | High | Excellent | Slower |
| Q8_0 | Very High | Near-Original | Slow |
| F16 | Highest | Original | Slowest |

**Recommended**: Q4_K_M for most models (best balance)

---

## Hardware Requirements

### Your Current Setup

Based on having LM Studio running with 13 models, you likely have:
- **GPU**: 8GB+ VRAM (RTX 3060/3070 or similar)
- **RAM**: 16GB+ system RAM
- **Storage**: SSD with 100GB+ free

### Recommendations by GPU VRAM

| VRAM | Max Model Size | Recommended Models |
|------|----------------|-------------------|
| 6GB | 7B Q4 | phi-3.5, gemma-4b |
| 8GB | 13B Q4 | qwen2.5-7b, codellama-7b |
| 12GB | 22B Q4 | codestral-22b, mistral-7b |
| 16GB | 30B Q4 | qwen3-coder-30b |
| 24GB | 70B Q4 | llama-70b, codellama-34b |

---

## Model Performance Tips

### Speed Optimization

1. **Use smaller models for quick tasks**
   - gemma-3-4b for simple completions
   - phi-3.5-mini for documentation

2. **Batch similar requests**
   - Group code generation tasks
   - Process templates together

3. **Keep models loaded**
   - Don't switch models frequently
   - Pre-load commonly used models

### Quality Optimization

1. **Use larger models for critical tasks**
   - qwen3-coder-30b for architecture
   - deepseek-r1 for complex reasoning

2. **Lower temperature for code**
   - 0.1-0.3 for TypeScript
   - 0.7+ for creative content

3. **Provide context**
   - Include file imports
   - Show existing patterns

---

## Cost Comparison

### Claude API vs LM Studio

| Task | Claude API | LM Studio | Savings |
|------|------------|-----------|---------|
| 1000 code completions | ~$5-10 | $0 | 100% |
| Documentation (10 pages) | ~$2-5 | $0 | 100% |
| Code review (100 files) | ~$10-20 | $0 | 100% |
| Template metadata (1000) | ~$5-15 | $0 | 100% |

**Monthly Savings Estimate**: $50-200+ depending on usage

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Model not loading | Reduce context length, try smaller quantization |
| Slow responses | Use smaller model, reduce max_tokens |
| Out of memory | Unload unused models, use Q4 quantization |
| Poor quality | Try larger model, adjust temperature |
| Timeouts | Increase timeout, use streaming |

---

*Generated: 2025-12-21 | Updated as new models are installed*
