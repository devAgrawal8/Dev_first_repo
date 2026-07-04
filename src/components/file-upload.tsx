"use client";

import { useCallback, useState } from "react";
import { Upload, FileCode, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadComplete: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles = Array.from(incoming);
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !names.has(f.name))];
    });
    setError(null);
    setSuccess(null);
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(data.message);
      setFiles([]);
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium">
          Drag & drop code files or PDFs here
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Supports .ts, .py, .js, .md, .pdf, and more
        </p>
        <label>
          <input
            type="file"
            multiple
            className="hidden"
            accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.cpp,.c,.cs,.rb,.php,.swift,.kt,.sql,.sh,.yaml,.yml,.json,.xml,.html,.css,.scss,.md,.txt,.pdf,.vue,.svelte"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <Button variant="outline" size="sm" asChild>
            <span>Browse files</span>
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between rounded-md border bg-secondary/30 px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                {file.name.endsWith(".pdf") ? (
                  <FileText className="h-4 w-4 text-orange-400" />
                ) : (
                  <FileCode className="h-4 w-4 text-blue-400" />
                )}
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => removeFile(file.name)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing & embedding...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {files.length} file{files.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-400">
          {success}
        </p>
      )}
    </div>
  );
}
