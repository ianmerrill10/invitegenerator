# InviteGenerator RAG System Architecture

## Overview

A powerful, local Retrieval-Augmented Generation (RAG) system for the InviteGenerator project that enables:
- Semantic search across all project files
- Progress tracking and work history
- Context retrieval for AI-assisted development
- Knowledge base for project decisions

---

## System Components

### 1. Document Ingestion (`lib/rag/ingestion.ts`)

**Purpose:** Parse and process all project files for indexing.

**Supported File Types:**
| Type | Extensions | Chunking Strategy |
|------|------------|-------------------|
| Code | .ts, .tsx, .js, .jsx | By function/class boundaries |
| Documentation | .md | By heading sections |
| Configuration | .json, .env, .yaml | Whole file |
| Logs | .csv, .log | By entry/row |
| Styles | .css, .scss | By selector blocks |

**Features:**
- File hash tracking for incremental updates
- Gitignore-aware (skip node_modules, .next, etc.)
- Metadata extraction (file path, type, last modified)
- Code structure parsing (exports, imports, functions)

---

### 2. Chunking Engine (`lib/rag/chunking.ts`)

**Purpose:** Split documents into optimal chunks for embedding.

**Strategies:**
- **Semantic Chunking:** Split at natural boundaries (functions, classes, sections)
- **Sliding Window:** Overlap chunks for context continuity
- **Size Limits:** 512-2048 tokens per chunk (configurable)
- **Metadata Preservation:** Keep file path, line numbers, type

**Chunk Structure:**
```typescript
interface Chunk {
  id: string;              // Unique chunk ID
  content: string;         // The text content
  metadata: {
    filePath: string;      // Source file
    startLine: number;     // Starting line number
    endLine: number;       // Ending line number
    type: string;          // 'code' | 'docs' | 'config' | 'log'
    language?: string;     // Programming language
    symbols?: string[];    // Exported functions/classes
  };
  hash: string;            // Content hash for deduplication
}
```

---

### 3. Embedding Service (`lib/rag/embeddings.ts`)

**Purpose:** Generate vector embeddings using local LM Studio.

**Model:** `text-embedding-nomic-embed-text-v1.5` (local)
**Endpoint:** `http://localhost:1234/v1/embeddings`
**Dimensions:** 768 (nomic-embed-text)

**Features:**
- Batch processing (up to 32 chunks per request)
- Retry logic with exponential backoff
- Embedding caching to avoid recomputation
- Normalization for cosine similarity

**API:**
```typescript
interface EmbeddingService {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  similarity(a: number[], b: number[]): number;
}
```

---

### 4. Vector Storage (`lib/rag/storage.ts`)

**Purpose:** Store and retrieve vector embeddings efficiently.

**Storage Backend:** SQLite with JSON columns (simple, portable, no dependencies)

**Schema:**
```sql
CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding BLOB NOT NULL,      -- Float32Array as binary
  metadata JSON NOT NULL,
  file_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_file_path ON chunks(file_path);
CREATE INDEX idx_file_hash ON chunks(file_hash);

CREATE TABLE file_index (
  file_path TEXT PRIMARY KEY,
  file_hash TEXT NOT NULL,
  chunk_count INTEGER NOT NULL,
  last_indexed INTEGER NOT NULL
);
```

**Features:**
- Fast file-based storage (no server needed)
- Binary embedding storage for efficiency
- File hash tracking for incremental updates
- Full-text search fallback

---

### 5. Query Engine (`lib/rag/query.ts`)

**Purpose:** Semantic search and retrieval.

**Search Algorithm:**
1. Embed query text
2. Calculate cosine similarity with all chunks
3. Rank by similarity score
4. Apply filters (file type, path pattern)
5. Return top-k results with context

**Query Types:**
- **Semantic:** "How does authentication work?"
- **Keyword:** "find all TODO comments"
- **Hybrid:** Combine semantic + keyword scoring
- **File-scoped:** Search within specific files/folders

**API:**
```typescript
interface QueryEngine {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  findSimilar(chunkId: string, k?: number): Promise<SearchResult[]>;
  getContext(filePath: string, lineNumber: number): Promise<Chunk[]>;
}

interface SearchOptions {
  limit?: number;           // Max results (default: 10)
  threshold?: number;       // Min similarity (default: 0.5)
  fileTypes?: string[];     // Filter by type
  pathPattern?: string;     // Glob pattern filter
  includeContent?: boolean; // Include full content
}

interface SearchResult {
  chunk: Chunk;
  score: number;            // Similarity score 0-1
  highlights?: string[];    // Matching excerpts
}
```

---

### 6. Progress Tracker (`lib/rag/progress.ts`)

**Purpose:** Special handling for work tracking and project progress.

**Tracked Items:**
- Work logs from `logs/work-tracking/`
- TODO/FIXME comments in code
- Completed tasks from CSV logs
- Blueprint items from docs

**Features:**
- Daily progress summaries
- Completion rate tracking
- Blocker identification
- Work pattern analysis

**API:**
```typescript
interface ProgressTracker {
  getCompletedTasks(since?: Date): Promise<Task[]>;
  getPendingTasks(): Promise<Task[]>;
  getBlockers(): Promise<Blocker[]>;
  getDailySummary(date: Date): Promise<DailySummary>;
  getProjectStatus(): Promise<ProjectStatus>;
}
```

---

### 7. Context Assembler (`lib/rag/context.ts`)

**Purpose:** Build optimal context for LLM queries.

**Features:**
- Relevance ranking with MMR (Maximal Marginal Relevance)
- Deduplication of similar chunks
- Token budget management
- Source attribution

**API:**
```typescript
interface ContextAssembler {
  buildContext(query: string, tokenBudget?: number): Promise<Context>;
  formatForPrompt(context: Context): string;
}

interface Context {
  chunks: Chunk[];
  totalTokens: number;
  sources: string[];        // File paths for attribution
}
```

---

### 8. CLI Interface (`scripts/rag-cli.ts`)

**Commands:**
```bash
# Index the project
npx tsx scripts/rag-cli.ts index [--force] [--path <glob>]

# Search the knowledge base
npx tsx scripts/rag-cli.ts search "query text" [--limit 10] [--type code]

# Get project progress
npx tsx scripts/rag-cli.ts progress [--since 7d]

# Find similar code
npx tsx scripts/rag-cli.ts similar <file:line> [--limit 5]

# Get context for a task
npx tsx scripts/rag-cli.ts context "task description" [--tokens 4000]

# Show stats
npx tsx scripts/rag-cli.ts stats
```

---

### 9. API Routes (`app/api/rag/`)

**Endpoints:**
```
POST /api/rag/index          - Trigger re-indexing
GET  /api/rag/search         - Search knowledge base
GET  /api/rag/progress       - Get project progress
GET  /api/rag/context        - Get context for query
GET  /api/rag/stats          - Get index statistics
```

---

## Data Flow

```
┌─────────────────┐
│   Project Files  │
│  (.ts, .md, etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Ingestion     │ ← File watcher / Manual trigger
│   Engine        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Chunking      │ ← Smart splitting by file type
│   Engine        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Embedding     │ ← LM Studio (nomic-embed)
│   Service       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vector        │ ← SQLite database
│   Storage       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Query         │ ← Semantic search
│   Engine        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Context       │ ← Build LLM prompts
│   Assembler     │
└─────────────────┘
```

---

## Configuration

**File:** `lib/rag/config.ts`

```typescript
export const RAG_CONFIG = {
  // Embedding settings
  embedding: {
    model: 'text-embedding-nomic-embed-text-v1.5',
    endpoint: 'http://localhost:1234/v1/embeddings',
    dimensions: 768,
    batchSize: 32,
  },

  // Chunking settings
  chunking: {
    maxTokens: 1024,
    overlap: 128,
    minTokens: 64,
  },

  // Storage settings
  storage: {
    dbPath: './data/rag.db',
    backupPath: './data/rag-backup.db',
  },

  // Search settings
  search: {
    defaultLimit: 10,
    minSimilarity: 0.5,
    mmrLambda: 0.7,  // Diversity vs relevance
  },

  // Indexing settings
  indexing: {
    ignorePaths: [
      'node_modules/**',
      '.next/**',
      '.git/**',
      'coverage/**',
      '*.lock',
    ],
    includePaths: [
      'app/**',
      'lib/**',
      'components/**',
      'scripts/**',
      'docs/**',
      'logs/**',
    ],
  },
};
```

---

## Directory Structure

```
invitegeneratordevelopment/
├── lib/
│   └── rag/
│       ├── index.ts           # Main exports
│       ├── config.ts          # Configuration
│       ├── ingestion.ts       # Document ingestion
│       ├── chunking.ts        # Chunk splitting
│       ├── embeddings.ts      # Embedding generation
│       ├── storage.ts         # Vector storage
│       ├── query.ts           # Search engine
│       ├── progress.ts        # Progress tracking
│       ├── context.ts         # Context assembly
│       └── types.ts           # TypeScript interfaces
├── scripts/
│   └── rag-cli.ts             # CLI interface
├── app/
│   └── api/
│       └── rag/
│           ├── index/route.ts
│           ├── search/route.ts
│           ├── progress/route.ts
│           └── context/route.ts
├── data/
│   └── rag.db                 # SQLite database
└── docs/
    └── RAG-SYSTEM-ARCHITECTURE.md
```

---

## Implementation Order

1. **Types & Config** - Define interfaces and configuration
2. **Storage** - SQLite wrapper for vectors
3. **Embeddings** - LM Studio integration
4. **Chunking** - Document splitting logic
5. **Ingestion** - File processing pipeline
6. **Query** - Semantic search
7. **Progress** - Work tracking
8. **Context** - LLM context building
9. **CLI** - Command-line interface
10. **API** - HTTP endpoints

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Index full project | < 5 minutes |
| Incremental update | < 30 seconds |
| Search query | < 500ms |
| Context assembly | < 1 second |
| Storage size | < 100MB |

---

## Dependencies

**Required (already installed):**
- `openai` - For embedding API compatibility
- `zod` - Input validation
- `uuid` - Unique IDs

**New (need to add):**
- `better-sqlite3` - SQLite wrapper (fast, sync API)
- `glob` - File pattern matching

---

*Architecture designed for InviteGenerator project.*
*All code to be generated via LM Studio per project rules.*
