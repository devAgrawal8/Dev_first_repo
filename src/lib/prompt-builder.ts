import type { SimilarityResult } from "@/types";

export function buildSystemPrompt(): string {
  return `You are CodeVault AI, an expert software engineer and technical analyst.
You answer questions about uploaded codebases and PDF documents using ONLY the provided context chunks.
Rules:
- Cite specific file names when referencing code.
- If the context does not contain enough information, say so clearly.
- Provide concise, accurate, and actionable answers.
- Use markdown code blocks when showing code snippets.
- Do not invent APIs, functions, or file paths not present in the context.`;
}

export function buildUserPrompt(
  query: string,
  chunks: SimilarityResult[]
): string {
  const contextBlock = chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}: ${chunk.fileName} (chunk ${chunk.chunkIndex + 1}, relevance: ${(chunk.score * 100).toFixed(1)}%)]\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  return `Context from uploaded documents:

${contextBlock}

---

Question: ${query}

Answer based on the context above:`;
}

export function extractSourceFiles(chunks: SimilarityResult[]): string[] {
  return [...new Set(chunks.map((c) => c.fileName))];
}
