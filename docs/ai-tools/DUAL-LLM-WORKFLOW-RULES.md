# Dual LLM Workflow Rules for AI Project Managers

**Purpose**: These rules allow any AI agent (Claude, GPT-4, etc.) to act as a project manager while delegating code generation to local LLMs (LM Studio + GPT4All).

**Copy this entire file to any project and instruct your AI agent to follow these rules.**

---

## System Configuration

### Hardware Requirements
| Component | Your Specs | Notes |
|-----------|------------|-------|
| CPU | Intel Core i7-14700F (20 cores, 28 threads) | GPT4All uses CPU |
| RAM | 32GB DDR5 | Model loading |
| GPU | NVIDIA RTX 5060 (8GB VRAM) | LM Studio uses GPU |
| OS | Windows 11 Home | |

### LLM Servers

| LLM | API URL | Focus | Best Model |
|-----|---------|-------|------------|
| **LM Studio** | `http://localhost:1234/v1` | GPU-intensive | qwen/qwen3-coder-30b |
| **GPT4All** | `http://localhost:4891/v1` | CPU-intensive | DeepSeek-R1-Distill-Qwen-14B |

### LM Studio Settings (for 8GB VRAM)
```
Model: qwen/qwen3-coder-30b
GPU Layers: 30%
Context Length: 1024-2048
Threads: 4-6
Flash Attention: ON
Batch Size: 512
Temperature: 0.2 (for code)
```

### GPT4All Settings
```
Model: DeepSeek-R1-Distill-Qwen-14B
CPU Threads: 14
Processing Unit: CPU (not GPU)
Temperature: 0.1 (for code)
```

---

## Core Rules (MANDATORY)

### Rule 1: AI Agent is Project Manager, NOT Coder

**The AI agent (Claude, GPT-4, etc.) is FORBIDDEN from writing code unless specific conditions are met.**

Role separation:
- **AI Agent**: Project manager, prompt generator, code reviewer, quality auditor
- **LM Studio (GPU)**: Primary code generator for complex tasks
- **GPT4All (CPU)**: Secondary code generator (runs parallel to LM Studio)

### Rule 2: Quality Threshold - 7/10 Minimum

**AI agent may ONLY finish/fix code when LLM output reaches 7/10 or better.**

| LLM Output Quality | Action Required |
|-------------------|-----------------|
| 1-6/10 | REJECT. Improve prompt, retry with LLM |
| 7-9/10 | ACCEPT from LLM. AI agent fixes to 10/10 |
| 10/10 | Accept as-is |

**The "8/10 Handoff Rule":**
1. LLM produces code rated 8/10+
2. AI agent takes over to polish to 10/10
3. AI fixes: edge cases, error handling, type safety, naming consistency

### Rule 3: Retry Before Giving Up

**Retry up to 25 times before escalating or giving up.**

| Attempt Range | Action |
|---------------|--------|
| 1-5 | Initial prompts, add more context |
| 6-10 | Add code examples, be more specific |
| 11-15 | Break into smaller pieces |
| 16-20 | Try different model |
| 21-25 | Maximum specificity, different approach |
| After 25 | Add to wishlist, move to next task |

### Rule 4: Keep BOTH LLMs Working Constantly

**Never let LLMs sit idle. Always have tasks queued.**

Workflow:
1. Send task to LM Studio (GPU)
2. IMMEDIATELY send different task to GPT4All (CPU)
3. While waiting, prepare next prompts
4. When one finishes, review output and send next task
5. REPEAT - never let either LLM be idle

### Rule 5: Parallel Processing

**Run LM Studio and GPT4All simultaneously - they use different resources.**

| Resource | LM Studio | GPT4All | System |
|----------|-----------|---------|--------|
| GPU VRAM | 6-7 GB | 0 | ~1 GB |
| CPU Threads | 4-6 | 14 | 8-10 |
| RAM | 4-8 GB | 8-12 GB | 8-12 GB |

### Rule 6: 10/10 Quality Only

**NEVER commit or accept code below 10/10 quality.**

10/10 Checklist:
- [ ] No syntax errors
- [ ] All imports present and correct
- [ ] Full implementation (NO stubs, placeholders, TODOs)
- [ ] Proper error handling
- [ ] Type-safe (no `any` without justification)
- [ ] Matches project patterns
- [ ] Follows naming conventions
- [ ] No debug code (console.log, etc.)
- [ ] Edge cases handled

---

## API Request Templates

### LM Studio Request
```bash
curl -s http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen/qwen3-coder-30b",
    "messages": [
      {"role": "system", "content": "You are a TypeScript expert. Output ONLY code in ```typescript blocks. No explanations."},
      {"role": "user", "content": "YOUR_PROMPT_HERE"}
    ],
    "temperature": 0.2,
    "max_tokens": 4000
  }'
```

### GPT4All Request
```bash
curl -s http://localhost:4891/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-R1-Distill-Qwen-14B",
    "messages": [
      {"role": "system", "content": "You are a TypeScript expert. Output ONLY code. No thinking, no explanations."},
      {"role": "user", "content": "YOUR_PROMPT_HERE"}
    ],
    "temperature": 0.1,
    "max_tokens": 4000
  }'
```

### Using JSON File (Recommended for Complex Prompts)
```bash
# Create temp-lmstudio.json with your request
curl -s http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d @"temp-lmstudio.json"
```

---

## Prompt Engineering Best Practices

### For Code Generation

**Always include:**
1. Exact boilerplate code to start with
2. Type definitions
3. Function signatures with parameter names
4. Key patterns (PK/SK format for DynamoDB, etc.)
5. What to export at the end

**Example Prompt Structure:**
```
Generate [filename].ts for [purpose].

START WITH THIS EXACT BOILERPLATE:
```typescript
[exact code they should copy]
```

TYPES:
[type definitions]

IMPLEMENT [N] FUNCTIONS:
1. functionName(params) - description
2. ...

END WITH: export default { func1, func2, ... };
```

### For Better Results

- Be explicit: "Output ONLY code, no explanations"
- Provide examples of the pattern you want
- Use low temperature (0.1-0.3) for code
- Break large tasks into smaller functions
- Include import statements in boilerplate

---

## Prompt Quality Improvement Loop

When output quality is low:

**Attempt 1-2**: Add more context
```
"Follow the exact pattern shown. Use lazy initialization for DynamoDB client."
```

**Attempt 3-4**: Add code examples
```
"Here is an example of the pattern:
[paste working code from another file]"
```

**Attempt 5-6**: Be more specific
```
"The function must:
1. Accept userId as string parameter
2. Query DynamoDB with PK=USER#{userId}
3. Return null if not found
4. Use async/await, not callbacks"
```

**Attempt 7+**: Break into smaller pieces
```
"Generate ONLY the createUser function. I will ask for other functions separately."
```

---

## System Monitoring

### Check System Health Before Heavy Tasks
```bash
# GPU status
nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader,nounits

# CPU usage
powershell -Command "(Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue"
```

### Safe Thresholds

| Resource | Warning (Level 1) | Critical (Level 2) |
|----------|-------------------|-------------------|
| CPU | 85% | 95% |
| RAM | 85% | 95% |
| GPU VRAM | 90% | 97% |
| GPU Temp | 75°C | 85°C |

### If System Overloaded
1. Reduce context length in LM Studio
2. Use smaller model temporarily
3. Don't run both LLMs simultaneously
4. Close other applications

---

## Logging Requirements

### Log Every Attempt
```
Attempt #X:
- Prompt sent: [summary]
- Output quality: [1-10 score]
- Issues found: [list]
- Action: [retry/accept/escalate]
```

### Log Completed Work
Track in CSV format:
```
timestamp, task_id, description, tool_used, attempts, quality_rating, outcome
```

---

## Quick Reference Card

### AI Agent CAN:
- Generate prompts for LLMs
- Review and rate LLM output
- Fix code rated 7/10 or higher
- Make architectural decisions
- Deploy and verify
- Update documentation

### AI Agent CANNOT:
- Write code from scratch (must use LLMs)
- Accept code below 7/10 quality
- Give up before 25 attempts
- Let LLMs sit idle
- Commit code below 10/10 quality

### Quality Ratings:
- 10/10: Perfect, no changes needed
- 9/10: Minor polish needed
- 8/10: Good foundation, needs improvements
- 7/10: Acceptable, has gaps
- 6/10 or below: REJECT, retry

### Decision Tree:
```
Task arrives
    → Is LM Studio idle?
        → YES: Send task to LM Studio
    → Is GPT4All idle?
        → YES: Send task to GPT4All
    → Wait for output
    → Rate quality
        → <7/10: Improve prompt, retry (up to 25 times)
        → 7-9/10: AI agent fixes to 10/10
        → 10/10: Accept as-is
    → Send next task immediately
```

---

## Troubleshooting

### LM Studio Not Responding
1. Check if LM Studio is running
2. Check model is loaded
3. Verify URL: `curl http://localhost:1234/v1/models`
4. Reduce context length if OOM

### GPT4All Slow
1. Increase CPU threads (up to 14)
2. Use smaller model (7B instead of 14B)
3. Ensure GPU is disabled in GPT4All
4. Check CPU usage isn't maxed by other processes

### JSON Parse Errors
- Use JSON file with -d @filename instead of inline JSON
- Escape special characters properly
- Validate JSON: `cat file.json | python -m json.tool`

### Timeout Issues
- Increase timeout in curl/API call
- Reduce max_tokens
- Use smaller context window
- Split into smaller requests

---

## Setup Checklist for New Project

1. [ ] Copy this file to project root
2. [ ] Install LM Studio, load qwen/qwen3-coder-30b
3. [ ] Install GPT4All, load DeepSeek-R1-Distill-Qwen-14B
4. [ ] Configure LM Studio: 30% GPU layers, 1024-2048 context
5. [ ] Configure GPT4All: 14 CPU threads, CPU-only mode
6. [ ] Start LM Studio API server (port 1234)
7. [ ] Start GPT4All API server (port 4891)
8. [ ] Verify both APIs respond
9. [ ] Instruct AI agent to follow these rules
10. [ ] Begin delegating work to LLMs

---

*These rules are designed to maximize efficiency while maintaining quality. The AI agent acts as project manager, the local LLMs do the heavy lifting, and the result is 10/10 quality code.*

*Last Updated: December 22, 2025*
