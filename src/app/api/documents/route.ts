import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vector-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const store = getVectorStore();
    const documents = await store.listDocuments();
    return NextResponse.json({ documents, count: documents.length });
  } catch (error) {
    console.error("Documents list error:", error);
    const message = error instanceof Error ? error.message : "Failed to list documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const store = getVectorStore();
    await store.clear();
    return NextResponse.json({ success: true, message: "All documents cleared" });
  } catch (error) {
    console.error("Clear error:", error);
    const message = error instanceof Error ? error.message : "Failed to clear documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
