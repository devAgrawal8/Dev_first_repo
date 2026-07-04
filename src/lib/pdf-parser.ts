export async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractFileContent(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return parsePdf(buffer);
  }

  return buffer.toString("utf-8");
}
