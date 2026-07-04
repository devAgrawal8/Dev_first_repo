import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export function getChatModel(): string {
  return process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
}

export function getEmbeddingModel(): string {
  return process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: getEmbeddingModel(),
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: getEmbeddingModel(),
    input: texts,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export async function* streamChatCompletion(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model: getChatModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    temperature: 0.3,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}
