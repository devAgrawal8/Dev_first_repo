import { NextRequest, NextResponse } from "next/server";
import { chunkMultipleFiles } from "@/lib/chunker";
import { extractFileContent } from "@/lib/pdf-parser";
import { generateEmbeddings } from "@/lib/openai";
import { getVectorStore } from "@/lib/vector-store";
import type { DocumentChunk } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const parsedFiles: { fileName: string; content: string }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const content = await extractFileContent(file.name, buffer);

      if (!content.trim()) {
        continue;
      }

      parsedFiles.push({ fileName: file.name, content });
    }

    if (!parsedFiles.length) {
      return NextResponse.json(
        { error: "No readable content found in uploaded files" },
        { status: 400 }
      );
    }

    const rawChunks = await chunkMultipleFiles(parsedFiles);
    const embeddings = await generateEmbeddings(rawChunks.map((c) => c.content));

    const chunks: DocumentChunk[] = rawChunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i],
    }));

    const store = getVectorStore();
    await store.insert(chunks);

    const results = parsedFiles.map((f) => ({
      fileName: f.fileName,
      chunksCreated: chunks.filter((c) => c.fileName === f.fileName).length,
    }));

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${parsedFiles.length} file(s)`,
      results,
      totalChunks: chunks.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }

    const store = getVectorStore();
    await store.deleteDocument(fileName);

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error("Delete error:", error);
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
