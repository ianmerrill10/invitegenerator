# LM Studio Prompt Learnings

> Lessons learned from prompting LM Studio models. Review before every prompt.
> Last Updated: 2025-12-21

---

## Quick Reference: What Works vs What Fails

### DO (Effective Prompts)

| Technique | Example | Why It Works |
|-----------|---------|--------------|
| Provide code skeleton | "Fill in TODO sections" | Model follows structure |
| Use explicit file paths | `join(__dirname, '..', 'logs')` | Prevents path errors |
| Specify imports | "Use import.meta.url with fileURLToPath" | Prevents ES module issues |
| Lower temperature for code | 0.2-0.3 | More deterministic output |
| Break into smaller tasks | Ask for one function at a time | Better focus |
| Include examples | Show expected input/output | Clearer requirements |

### DON'T (Failed Prompts)

| Mistake | What Happened | Fix |
|---------|---------------|-----|
| Open-ended "create X" | Incomplete implementation, stubs | Provide skeleton code |
| "Use __dirname" | Breaks ES modules | Explicitly say "use import.meta.url" |
| "Implement sync function" | Got placeholder `console.log` | Say "FULLY implement, no stubs" |
| Not specifying file names | Got wrong names (tasks.csv) | Explicitly list all file paths |
| High temperature (0.7+) | Inconsistent, creative errors | Use 0.2-0.3 for code |
| Asking for 3000+ tokens | Truncated/incomplete | Break into parts |

---

## Model-Specific Learnings

### qwen2.5-coder-7b-instruct

**Strengths:**
- Good at TypeScript syntax
- Follows code structure well
- Understands async/await

**Weaknesses:**
- Forgets context between prompts
- Creates stubs when not explicitly told otherwise
- Defaults to CommonJS patterns (__dirname)
- XLSX handling is often wrong (eachRow usage)

**Best Practices:**
1. Always provide skeleton code
2. Say "NO STUBS, NO PLACEHOLDERS"
3. Use temperature 0.2-0.3
4. Explicitly state ES module requirements
5. For complex logic, break into multiple prompts

---

## Prompt Templates That Work

### Template 1: Code Completion with Skeleton

```
Complete this code by filling in the TODO sections:

\`\`\`typescript
// Provide full imports
// Provide constants
// Provide function signatures with TODO comments
\`\`\`

Requirements:
1. [Specific requirement 1]
2. [Specific requirement 2]

Output ONLY the complete TypeScript code, no explanations.
```

### Template 2: Fix/Improve Existing Code

```
Improve this code with the following fixes:

CRITICAL FIXES NEEDED:
1. [Specific fix with example]
2. [Specific fix with example]

Current code:
\`\`\`typescript
[paste code]
\`\`\`

Generate the COMPLETE improved code.
```

### Template 3: Function Implementation

```
Implement this function:

Function signature:
\`\`\`typescript
async function doThing(param: Type): Promise<ReturnType>
\`\`\`

Requirements:
- [Requirement 1]
- [Requirement 2]
- Use try/catch for error handling
- Return [specific format]

Example usage:
\`\`\`typescript
const result = await doThing("input");
// Expected output: { ... }
\`\`\`
```

---

## Attempt History: Recordkeeper Agent

### Attempt 1 (Score: 6/10)
- **Prompt**: Open-ended "create recordkeeper agent"
- **Issues**: Used __dirname, task counter reset each run, no CSV header
- **Learning**: Don't use open-ended prompts for complex agents

### Attempt 2 (Score: 7/10)
- **Prompt**: Added "use import.meta.url" and specific requirements
- **Issues**: sync/verify/report were stubs, still minor path issues
- **Learning**: Say "FULLY implement, NO STUBS"

### Attempt 3 (Score: 5/10)
- **Prompt**: Asked for improvements to previous output
- **Issues**: Model lost context, wrong file names, incomplete
- **Learning**: Don't ask to "improve" - provide full skeleton instead

### Attempt 4 (Score: 8/10) - SUCCESS
- **Prompt**: Provided complete skeleton with TODO comments
- **Result**: All functions implemented, correct file names, CLI works
- **Learning**: Skeleton + TODO is the most effective pattern

---

## Settings Optimization

### For This PC (RTX 5060, 8GB VRAM)

| Model | GPU Layers | Context | Best For |
|-------|------------|---------|----------|
| qwen2.5-coder-7b | 100% (35 layers) | 4096 | Primary coding |
| phi-3.5-mini | 100% | 8192 | Quick tasks |

### Recommended Settings
- Temperature: 0.2-0.3 for code
- Max Tokens: 2000-4000 (don't exceed)
- Top P: 0.9
- Repeat Penalty: 1.1

---

## Future Improvements

- [ ] Test with qwen3-coder-30b for complex tasks
- [ ] Try lower context (2048) for faster responses
- [ ] Build prompt template library
- [ ] Test streaming for long responses

---

*This document is continuously updated. Add new learnings after each LM Studio session.*
