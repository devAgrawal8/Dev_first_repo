import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

const CODE_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "py", "java", "go", "rs", "cpp", "c", "h",
  "cs", "rb", "php", "swift", "kt", "scala", "sql", "sh", "bash", "yaml",
  "yml", "json", "xml", "html", "css", "scss", "md", "vue", "svelte",
]);

export function detectFileType(fileName: string): "code" | "pdf" | "text" {
  const ext = getFileExtension(fileName);
  if (ext === "pdf") return "pdf";
  if (CODE_EXTENSIONS.has(ext)) return "code";
  return "text";
}

export function isTextFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ext !== "pdf";
}
