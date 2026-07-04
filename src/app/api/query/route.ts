import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, streamChatCompletion } from "@/lib/openai";
import {
  buildSystemPrompt,
  buildUserPrompt,
  extractSourceFiles,
} from "@/lib/prompt-builder";
import { getVectorStore, langChainFallbackQuery } from "@/lib/vector-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, fileName, useLangChainFallback, stream = true } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const store = getVectorStore();
    const documents = await store.listDocuments();

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "No documents uploaded yet. Please upload files first." },
        { status: 400 }
      );
    }

    if (useLangChainFallback) {
      const answer = await langChainFallbackQuery(query, fileName);
      return NextResponse.json({ answer, sources: [], mode: "langchain" });
    }

    const queryEmbedding = await generateEmbedding(query);
    const similarChunks = await store.similaritySearch(
      queryEmbedding,
      5,
      fileName
    );

    if (similarChunks.length === 0) {
      return NextResponse.json(
        { error: "No relevant context found for your query." },
        { status: 404 }
      );
    }

    const sources = extractSourceFiles(similarChunks);
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(query, similarChunks);

    if (!stream) {
      let fullAnswer = "";
      for await (const token of streamChatCompletion(systemPrompt, userPrompt)) {
        fullAnswer += token;
      }
      return NextResponse.json({ answer: fullAnswer, sources, mode: "openai" });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "sources", sources })}\n\n`
          )
        );

        try {
          for await (const token of streamChatCompletion(
            systemPrompt,
            userPrompt
          )) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "token", content: token })}\n\n`
              )
            );
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Stream failed";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Query error:", error);
    const message = error instanceof Error ? error.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
