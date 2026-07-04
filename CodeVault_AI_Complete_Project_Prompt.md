# CodeVault AI — Complete Project Specification

## Overview

**CodeVault AI** is a context-aware codebase chat assistant that lets developers upload code files and PDF documents, then ask intelligent questions about them using vector similarity search and GPT-powered answers with live streaming.

## Core Features

1. **File Upload** — Upload multiple code files (.ts, .py, .js, etc.) and PDF documents
2. **Intelligent Chunking** — Language-aware splitting with `RecursiveCharacterTextSplitter`
3. **Vector Embeddings** — OpenAI `text-embedding-3-small` (1536 dimensions)
4. **Vector Search** — Similarity search with optional file-name metadata filtering
5. **Streaming Chat** — Server-Sent Events (SSE) for live GPT answer generation
6. **Document Management** — List, filter-by-file, delete individual docs, clear vault
7. **LangChain Fallback** — Optional `RetrievalQAChain` mode for alternative retrieval

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TailwindCSS |
| UI | shadcn/ui-style components, Lucide icons |
| Backend | Next.js API Routes (Node.js runtime) |
| AI | OpenAI GPT-4o-mini + text-embedding-3-small |
| Vector DB | AstraDB (production) / In-memory (local dev) |
| Chunking | LangChain RecursiveCharacterTextSplitter |
| PDF Parsing | pdf-parse |
| Streaming | Fetch ReadableStream + SSE |

## Folder Structure

```
codevault-ai/
├── .env.example
├── .gitignore
├── README.md
├── CodeVault_AI_Complete_Project_Prompt.md   ← this file
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── api/
    │       ├── upload/route.ts       # POST: upload & embed, DELETE: remove doc
    │       ├── query/route.ts        # POST: vector search + streaming GPT
    │       └── documents/route.ts    # GET: list docs, DELETE: clear all
    ├── components/
    │   ├── ui/                       # Button, Input, Card, Badge, etc.
    │   ├── file-upload.tsx
    │   ├── document-list.tsx
    │   └── chat-interface.tsx
    ├── lib/
    │   ├── utils.ts
    │   ├── openai.ts
    │   ├── chunker.ts
    │   ├── pdf-parser.ts
    │   ├── prompt-builder.ts
    │   └── vector-store.ts
    └── types/
        └── index.ts
```

## API Endpoints

### `POST /api/upload`
Upload files via `multipart/form-data` with field `files[]`.
Returns chunk counts per file.

### `DELETE /api/upload`
Body: `{ "fileName": "example.ts" }` — removes all chunks for that file.

### `POST /api/query`
Body:
```json
{
  "query": "What does the auth module do?",
  "fileName": "auth.ts",
  "stream": true,
  "useLangChainFallback": false
}
```
Returns SSE stream with `sources`, `token`, and `done` events.

### `GET /api/documents`
Returns list of indexed documents with chunk counts.

### `DELETE /api/documents`
Clears the entire vault.

## Environment Variables

```env
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
ASTRA_DB_API_ENDPOINT=https://...apps.astra.datastax.com
ASTRA_DB_COLLECTION=codevault_chunks
USE_IN_MEMORY_VECTOR_STORE=true
```

## How It Works

```
Upload → Parse (text/PDF) → Chunk → Embed → Store in Vector DB
                                                    ↓
User Query → Embed query → Similarity Search → Build Prompt → Stream GPT Answer
```

## Getting Started

```bash
cd codevault-ai
cp .env.example .env.local
# Add your OPENAI_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Deployment

1. Set `USE_IN_MEMORY_VECTOR_STORE=false`
2. Configure AstraDB credentials
3. Deploy to Vercel, Railway, or any Node.js host
4. Set environment variables in the hosting dashboard

## Future Enhancements

- [ ] Multi-user authentication
- [ ] Folder/zip upload support
- [ ] Conversation history persistence
- [ ] Code syntax highlighting in chat
- [ ] GitHub repo import
- [ ] Rate limiting and usage quotas
