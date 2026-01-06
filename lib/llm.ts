import { env } from "@/app/env";
import { ChatGroq } from "@langchain/groq";

export const llm = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 1024,
  maxRetries: 2,
});
