"use client";

import { useEffect, useState } from "react";
import { Brain, Upload, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { DocumentList } from "@/components/document-list";
import { ChatInterface } from "@/components/chat-interface";

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => setHasDocuments((d.documents?.length ?? 0) > 0))
      .catch(() => setHasDocuments(false));
  }, [refreshKey]);

  const onUploadComplete = () => {
    setRefreshKey((k) => k + 1);
    setHasDocuments(true);
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Code<span className="gradient-text">Vault</span> AI
              </h1>
              <p className="text-xs text-muted-foreground">
                Context-aware codebase chat assistant
              </p>
            </div>
          </div>

          <div className="flex gap-2 md:hidden">
            <button
              onClick={() => setActiveTab("upload")}
              className={`rounded-md px-3 py-1.5 text-sm ${
                activeTab === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`rounded-md px-3 py-1.5 text-sm ${
                activeTab === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Chat
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className={`lg:col-span-3 ${activeTab !== "upload" ? "hidden lg:block" : ""}`}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="h-4 w-4" />
                  Upload
                </CardTitle>
                <CardDescription>
                  Add code files or PDFs to your vault
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onUploadComplete={onUploadComplete} />
              </CardContent>
            </Card>
          </div>

          {/* Document list */}
          <div className="hidden lg:col-span-3 lg:block">
            <Card className="h-[calc(100vh-8rem)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vault</CardTitle>
                <CardDescription>
                  Browse indexed documents
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <DocumentList
                  refreshKey={refreshKey}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className={`lg:col-span-6 ${activeTab !== "chat" ? "hidden lg:block" : ""}`}>
            <Card className="h-[calc(100vh-8rem)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                  {selectedFile && (
                    <span className="text-xs font-normal text-muted-foreground">
                      — scoped to {selectedFile}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Ask questions powered by vector search + GPT
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <ChatInterface
                  selectedFile={selectedFile}
                  hasDocuments={hasDocuments}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
