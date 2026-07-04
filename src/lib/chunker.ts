import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { DocumentChunk } from "@/types";
import { detectFileType } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

const CODE_SEPARATORS = [
  "\nclass ",
  "\nfunction ",
  "\nexport ",
  "\nimport ",
  "\nconst ",
  "\nlet ",
  "\ninterface ",
  "\ntype ",
  "\n\n",
  "\n",
  " ",
  "",
];

const DEFAULT_SEPARATORS = ["\n\n", "\n", " ", ""];

export async function chunkText(
  text: string,
  fileName: string
): Promise<Omit<DocumentChunk, "embedding">[]> {
  const fileType = detectFileType(fileName);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: fileType === "code" ? 1500 : 1000,
    chunkOverlap: fileType === "code" ? 200 : 150,
    separators: fileType === "code" ? CODE_SEPARATORS : DEFAULT_SEPARATORS,
  });

  const chunks = await splitter.splitText(text);
  const uploadedAt = new Date().toISOString();

  return chunks.map((content, index) => ({
    id: uuidv4(),
    content,
    fileName,
    fileType,
    chunkIndex: index,
    totalChunks: chunks.length,
    uploadedAt,
  }));
}

export async function chunkMultipleFiles(
  files: { fileName: string; content: string }[]
): Promise<Omit<DocumentChunk, "embedding">[]> {
  const allChunks: Omit<DocumentChunk, "embedding">[] = [];

  for (const file of files) {
    const chunks = await chunkText(file.content, file.fileName);
    allChunks.push(...chunks);
  }

  return allChunks;
}
