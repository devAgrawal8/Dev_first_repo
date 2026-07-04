# CodeVault AI — Complete Folder Structure

```
codevault-ai/
│
├── .env.example                    # Environment variables template
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore rules
├── CodeVault_AI_Complete_Project_Prompt.md   # Full project specification
├── FOLDER_STRUCTURE.md             # This file
├── README.md                       # Project documentation
├── components.json                 # shadcn/ui configuration
├── next-env.d.ts                   # Next.js TypeScript declarations
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Dependencies & scripts
├── postcss.config.mjs              # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
│
├── public/
│   └── robots.txt                  # SEO robots file
│
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── documents/
    │   │   │   └── route.ts        # GET list docs, DELETE clear vault
    │   │   ├── query/
    │   │   │   └── route.ts        # POST chat query with SSE streaming
    │   │   └── upload/
    │   │       └── route.ts        # POST upload files, DELETE remove doc
    │   ├── globals.css             # Global styles & CSS variables
    │   ├── icon.tsx                # App favicon (dynamic)
    │   ├── layout.tsx              # Root layout
    │   └── page.tsx                # Main dashboard page
    │
    ├── components/
    │   ├── ui/
    │   │   ├── badge.tsx           # Badge component
    │   │   ├── button.tsx          # Button component
    │   │   ├── card.tsx            # Card component
    │   │   ├── index.ts            # UI barrel exports
    │   │   ├── input.tsx           # Input component
    │   │   ├── scroll-area.tsx     # Scroll area component
    │   │   └── textarea.tsx        # Textarea component
    │   ├── chat-interface.tsx      # Chat UI with streaming
    │   ├── document-list.tsx       # Document sidebar list
    │   └── file-upload.tsx         # Drag & drop file upload
    │
    ├── lib/
    │   ├── chunker.ts              # LangChain text chunking
    │   ├── index.ts                # Lib barrel exports
    │   ├── openai.ts               # OpenAI client & embeddings
    │   ├── pdf-parser.ts           # PDF text extraction
    │   ├── prompt-builder.ts       # GPT prompt construction
    │   ├── utils.ts                # Utility helpers
    │   └── vector-store.ts         # AstraDB + in-memory vector store
    │
    └── types/
        └── index.ts                # TypeScript type definitions
```

## Total Files: 38

## Quick Start

```bash
cd codevault-ai
cp .env.example .env.local
# Add OPENAI_API_KEY in .env.local
npm install
npm run dev
```

Open http://localhost:3000
