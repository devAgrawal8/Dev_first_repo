"use client";

import { useEffect, useState } from "react";
import { FileCode, FileText, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import type { UploadedDocument } from "@/types";

interface DocumentListProps {
  refreshKey: number;
  selectedFile: string | null;
  onSelectFile: (fileName: string | null) => void;
}

export function DocumentList({
  refreshKey,
  selectedFile,
  onSelectFile,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshKey]);

  const deleteDocument = async (fileName: string) => {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName }),
    });
    if (selectedFile === fileName) onSelectFile(null);
    fetchDocuments();
  };

  const clearAll = async () => {
    await fetch("/api/documents", { method: "DELETE" });
    onSelectFile(null);
    fetchDocuments();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Documents ({documents.length})
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={fetchDocuments}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {documents.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearAll}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents yet. Upload code or PDF files to get started.
          </p>
        ) : (
          <div className="space-y-2 pr-3">
            <button
              onClick={() => onSelectFile(null)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                selectedFile === null
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              All documents
            </button>

            {documents.map((doc) => (
              <div
                key={doc.fileName}
                className={`group rounded-md border px-3 py-2 transition-colors ${
                  selectedFile === doc.fileName
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <button
                  onClick={() => onSelectFile(doc.fileName)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    {doc.fileType === "pdf" ? (
                      <FileText className="h-4 w-4 shrink-0 text-orange-400" />
                    ) : (
                      <FileCode className="h-4 w-4 shrink-0 text-blue-400" />
                    )}
                    <span className="truncate text-sm font-medium">
                      {doc.fileName}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">{doc.fileType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {doc.chunkCount} chunks
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(doc.uploadedAt)}
                  </p>
                </button>
                <button
                  onClick={() => deleteDocument(doc.fileName)}
                  className="mt-1 hidden text-xs text-destructive group-hover:block"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
