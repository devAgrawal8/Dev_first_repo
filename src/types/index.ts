export interface DocumentChunk {
  id: string;
  content: string;
  fileName: string;
  fileType: "code" | "pdf" | "text";
  chunkIndex: number;
  totalChunks: number;
  uploadedAt: string;
  embedding?: number[];
}

export interface UploadedDocument {
  fileName: string;
  fileType: "code" | "pdf" | "text";
  chunkCount: number;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: string;
}

export interface QueryRequest {
  query: string;
  fileName?: string;
  useLangChainFallback?: boolean;
}

export interface UploadResponse {
  success: boolean;
  fileName: string;
  chunksCreated: number;
  message: string;
}

export interface SimilarityResult {
  content: string;
  fileName: string;
  score: number;
  chunkIndex: number;
}
