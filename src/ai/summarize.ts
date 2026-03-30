import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { summarizePrompt } from "./prompts";
import { ollama } from "ollama-ai-provider-v2";

export async function summarizeArticle(
  title: string,
  article: string,
): Promise<string> {
  if (!article || !article.trim()) {
    throw new Error("Article content is required to generate a summary.");
  }

  const prompt = summarizePrompt(title, article);

  const { text } = await generateText({
    // Model for Vercel AI
    model: "openai/gpt-5-nano",

    // Model for anthropic
    // model: anthropic("claude-sonnet-4-5"),

    // Model for ollama
    // model: ollama("qwen3:4b"),
    // providerOptions: { ollama: { think: true } },

    system: "You are an assistant that writes concise factual summaries.",
    prompt,
  });

  return (text ?? "").trim();
}

export default summarizeArticle;
