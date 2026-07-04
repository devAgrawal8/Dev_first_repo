import type { DocumentChunk, SimilarityResult, UploadedDocument } from "@/types";

export interface VectorStore {
  insert(chunks: DocumentChunk[]): Promise<void>;
  similaritySearch(
    queryEmbedding: number[],
    limit: number,
    fileName?: string
  ): Promise<SimilarityResult[]>;
  listDocuments(): Promise<UploadedDocument[]>;
  deleteDocument(fileName: string): Promise<void>;
  clear(): Promise<void>;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

class InMemoryVectorStore implements VectorStore {
  private chunks: DocumentChunk[] = [];

  async insert(chunks: DocumentChunk[]): Promise<void> {
    this.chunks.push(...chunks);
  }

  async similaritySearch(
    queryEmbedding: number[],
    limit: number,
    fileName?: string
  ): Promise<SimilarityResult[]> {
    let filtered = this.chunks;
    if (fileName) {
      filtered = filtered.filter((c) => c.fileName === fileName);
    }

    return filtered
      .filter((c) => c.embedding && c.embedding.length > 0)
      .map((chunk) => ({
        content: chunk.content,
        fileName: chunk.fileName,
        score: cosineSimilarity(queryEmbedding, chunk.embedding!),
        chunkIndex: chunk.chunkIndex,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async listDocuments(): Promise<UploadedDocument[]> {
    const docMap = new Map<string, UploadedDocument>();

    for (const chunk of this.chunks) {
      const existing = docMap.get(chunk.fileName);
      if (existing) {
        existing.chunkCount = Math.max(existing.chunkCount, chunk.totalChunks);
      } else {
        docMap.set(chunk.fileName, {
          fileName: chunk.fileName,
          fileType: chunk.fileType,
          chunkCount: chunk.totalChunks,
          uploadedAt: chunk.uploadedAt,
        });
      }
    }

    return Array.from(docMap.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async deleteDocument(fileName: string): Promise<void> {
    this.chunks = this.chunks.filter((c) => c.fileName !== fileName);
  }

  async clear(): Promise<void> {
    this.chunks = [];
  }
}

class AstraVectorStore implements VectorStore {
  private collection: Awaited<ReturnType<typeof this.getCollection>> | null = null;

  private async getCollection() {
    if (this.collection) return this.collection;

    const { DataAPIClient } = await import("@datastax/astra-db-ts");
    const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
    const endpoint = process.env.ASTRA_DB_API_ENDPOINT;
    const collectionName = process.env.ASTRA_DB_COLLECTION || "codevault_chunks";

    if (!token || !endpoint) {
      throw new Error("AstraDB credentials are not configured");
    }

    const client = new DataAPIClient(token);
    const db = client.db(endpoint);
    this.collection = await db.collection(collectionName);
    return this.collection;
  }

  async insert(chunks: DocumentChunk[]): Promise<void> {
    const collection = await this.getCollection();
    const docs = chunks.map((chunk) => ({
      _id: chunk.id,
      content: chunk.content,
      fileName: chunk.fileName,
      fileType: chunk.fileType,
      chunkIndex: chunk.chunkIndex,
      totalChunks: chunk.totalChunks,
      uploadedAt: chunk.uploadedAt,
      $vector: chunk.embedding,
    }));

    for (const doc of docs) {
      await collection.insertOne(doc);
    }
  }

  async similaritySearch(
    queryEmbedding: number[],
    limit: number,
    fileName?: string
  ): Promise<SimilarityResult[]> {
    const collection = await this.getCollection();
    const filter = fileName ? { fileName } : {};

    const cursor = collection.find(filter, {
      sort: { $vector: queryEmbedding },
      limit,
      includeSimilarity: true,
    });

    const results: SimilarityResult[] = [];
    for await (const doc of cursor) {
      results.push({
        content: doc.content as string,
        fileName: doc.fileName as string,
        score: (doc.$similarity as number) ?? 0,
        chunkIndex: doc.chunkIndex as number,
      });
    }

    return results;
  }

  async listDocuments(): Promise<UploadedDocument[]> {
    const collection = await this.getCollection();
    const cursor = collection.find({}, { limit: 1000 });
    const docMap = new Map<string, UploadedDocument>();

    for await (const doc of cursor) {
      const name = doc.fileName as string;
      const existing = docMap.get(name);
      if (existing) {
        existing.chunkCount = Math.max(existing.chunkCount, doc.totalChunks as number);
      } else {
        docMap.set(name, {
          fileName: name,
          fileType: doc.fileType as UploadedDocument["fileType"],
          chunkCount: doc.totalChunks as number,
          uploadedAt: doc.uploadedAt as string,
        });
      }
    }

    return Array.from(docMap.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async deleteDocument(fileName: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteMany({ fileName });
  }

  async clear(): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteMany({});
  }
}

let storeInstance: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (!storeInstance) {
    const useInMemory =
      process.env.USE_IN_MEMORY_VECTOR_STORE === "true" ||
      !process.env.ASTRA_DB_APPLICATION_TOKEN;

    storeInstance = useInMemory
      ? new InMemoryVectorStore()
      : new AstraVectorStore();
  }
  return storeInstance;
}

export async function langChainFallbackQuery(
  query: string,
  fileName?: string
): Promise<string> {
  const { generateEmbedding } = await import("@/lib/openai");
  const { buildSystemPrompt, buildUserPrompt } = await import("@/lib/prompt-builder");

  const store = getVectorStore();
  const docs = await store.listDocuments();

  if (docs.length === 0) {
    return "No documents found. Please upload files first.";
  }

  const results = await store.similaritySearch(
    await generateEmbedding(query),
    5,
    fileName
  );

  if (results.length === 0) {
    return "No relevant context found for your query.";
  }

  const { getOpenAIClient, getChatModel } = await import("@/lib/openai");
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: getChatModel(),
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(query, results) },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content ?? "No response generated.";
}
