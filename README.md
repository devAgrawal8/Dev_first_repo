# 🧠 CodeVault AI — Context-Aware Codebase Chat Assistant

CodeVault AI lets you upload **code files** and **PDF documents**, then ask intelligent, **context-aware questions** about them. Powered by OpenAI embeddings, vector similarity search, and streaming GPT responses.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green)

## Features

- Upload and chunk code files or PDFs with intelligent splitting
- Store 1536-dim OpenAI embeddings in a vector database
- Vector similarity search with metadata filtering by file name
- Ask questions and get streaming GPT answers with source citations
- In-memory vector store for local dev (no AstraDB required)
- Optional LangChain RetrievalQA fallback mode

## Quick Start

```bash
cd codevault-ai
cp .env.example .env.local
```

Add your `OPENAI_API_KEY` to `.env.local`, then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), upload files, and start chatting.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `OPENAI_CHAT_MODEL` | No | Default: `gpt-4o-mini` |
| `OPENAI_EMBEDDING_MODEL` | No | Default: `text-embedding-3-small` |
| `USE_IN_MEMORY_VECTOR_STORE` | No | Set `true` for local dev (default) |
| `ASTRA_DB_APPLICATION_TOKEN` | Prod | AstraDB token |
| `ASTRA_DB_API_ENDPOINT` | Prod | AstraDB endpoint URL |
| `ASTRA_DB_COLLECTION` | No | Default: `codevault_chunks` |

## Project Structure

See [CodeVault_AI_Complete_Project_Prompt.md](./CodeVault_AI_Complete_Project_Prompt.md) for the full specification.

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, shadcn/ui-style components
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT + text-embedding-3-small
- **Vector DB**: AstraDB (prod) / in-memory (dev)
- **Chunking**: LangChain RecursiveCharacterTextSplitter

## License

MIT
