# LM Studio Configuration Guide

> How to configure LM Studio for optimal performance on this PC.
> Last Updated: 2025-12-21

---

## This PC's Hardware

| Component | Specification |
|-----------|---------------|
| CPU | Intel Core i7-14700F (20 cores, 28 threads) |
| RAM | 32GB DDR5 |
| GPU | NVIDIA GeForce RTX 5060 (8GB VRAM) |

---

## CLI Location

```
C:\Program Files\LM Studio\resources\app\.webpack\lms.exe
```

**CLI Capabilities:**
- Download/manage models: YES
- Change runtime settings (GPU layers, context, threads): NO - GUI only

---

## Optimal Settings by Model Size

### qwen3-coder-30b (30B - PRIMARY MODEL)

| Setting | Value | Why |
|---------|-------|-----|
| GPU Offload | 24-28 layers (50-60%) | 8GB VRAM limit |
| Context Length | 2048 | Frees VRAM for more GPU layers |
| CPU Thread Pool | 20 | Match CPU cores |
| Batch Size | 512 | Default is fine |

### qwen2.5-coder-7b (7B)

| Setting | Value | Why |
|---------|-------|-----|
| GPU Offload | 100% (all layers) | Fits entirely in 8GB |
| Context Length | 4096 | Can handle more context |
| CPU Thread Pool | 20 | Match CPU cores |

### deepseek-r1-distill-qwen-14b (14B)

| Setting | Value | Why |
|---------|-------|-----|
| GPU Offload | 80% | Most fits in VRAM |
| Context Length | 2048 | Balance VRAM usage |
| CPU Thread Pool | 20 | Match CPU cores |

### codestral-22b (22B)

| Setting | Value | Why |
|---------|-------|-----|
| GPU Offload | 50% | Large model, limited VRAM |
| Context Length | 2048 | Reduce for VRAM |
| CPU Thread Pool | 20 | Match CPU cores |

---

## How to Change Settings (GUI Only)

### Step 1: Open Model Settings
1. In LM Studio, look at the loaded model in the left sidebar
2. Click the **gear icon** next to the model name
3. Or go to **Model Settings** tab

### Step 2: Adjust GPU Offload
1. Find "GPU Offload" slider
2. Drag to recommended value from table above
3. For qwen3-coder-30b: Set to **24-28** (not 14!)

### Step 3: Adjust Context Length
1. Find "Context Length" field
2. Enter recommended value from table above
3. For qwen3-coder-30b: Set to **2048**

### Step 4: Adjust CPU Threads
1. Find "CPU Thread Pool Size"
2. Set to **20** (matches i7-14700F cores)

### Step 5: Apply
1. Click Apply or Save
2. Model will reload with new settings
3. Check GPU usage in Task Manager to verify

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Out of memory error | Reduce GPU Offload by 2-3 layers |
| Model very slow | Increase GPU Offload if possible |
| GPU not being used | Check GPU Offload > 0 |
| High CPU usage, low GPU | GPU Offload too low |

---

## Performance Expectations

| Model | Expected Speed (tokens/sec) |
|-------|----------------------------|
| phi-3.5-mini (3.8B) | 30-50 |
| qwen2.5-coder-7b | 15-25 |
| deepseek-r1-14b | 8-15 |
| codestral-22b | 5-10 |
| qwen3-coder-30b | 3-8 |

---

*This guide is specific to this PC's hardware configuration.*
