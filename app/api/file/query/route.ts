import { llm } from "@/lib/llm";
import { NextRequest, NextResponse } from "next/server";
import { QdrantVectorStore } from "@langchain/qdrant";
import * as z from "zod";
import { embeddings } from "@/app/inngest/functions";
import { env } from "@/app/env";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const querySchema = z.object({
  text: z.string().min(1, "Text is required").max(500, "Text is too long"),
});

// Removed unused type
// type QuerySchema = z.infer<typeof querySchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = querySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data",
          error: parsed.error.issues.map(
            (issue) =>
              `error occurred at: ${issue.path.join(".")} of ${issue.message}`
          ),
        },
        { status: 400 }
      );
    }

    const { text } = parsed.data;

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: env.QDRANT_URL,
        apiKey: env.QDRANT_DB_API_KEY,
        collectionName: "pdf_bot",
      }
    );

    const docs = await vectorStore.similaritySearch(text, 2);
    const context = docs
      .map(
        (d, i) =>
          `Source ${i + 1} (page ${d.metadata.pageNumber ?? "?"}):\n${
            d.pageContent
          }`
      )
      .join("\n\n");

    // Enhanced system prompt with formatting instructions
    const systemPrompt = `You are a PDF question answering assistant. Follow these rules:
1. Answer ONLY from the provided context
2. If the answer is not present, say "I don't know"
3. Format your response properly:
   - Use proper punctuation and spacing
   - Don't break words with spaces in the middle
   - Use consistent spacing around parentheses and quotes
   - Format lists with clear numbering and spacing
   - Keep related words together without artificial breaks
   - Respond in plain text, no markdown formatting
   
Example of good formatting:
"The benefits of yoga include:
1. Lower levels of stress and increased feelings of happiness.
2. Exercises every part of the body through poses.
3. Improves the function of internal organs."

Example of bad formatting (avoid this):
"The benefits of yoga include: 1 . Lower levelsof stress and increasedfeelings of happiness .2 . Exercisesevery part of thebody througha series of poses"`;

    const streamIterator = await llm.stream([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Context:\n${context}\n\nQuestion:\n${text}`),
    ]);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamIterator) {
            if (chunk?.content) {
              // Handle different types of content that might come from the LLM
              let contentText: string;

              if (typeof chunk.content === "string") {
                contentText = chunk.content;
              } else if (Array.isArray(chunk.content)) {
                // If it's an array of content blocks, extract text from them
                contentText = chunk.content
                  .map((item) => {
                    if (typeof item === "string") return item;
                    if (item && typeof item === "object" && "text" in item) {
                      return item.text;
                    }
                    return "";
                  })
                  .filter(Boolean)
                  .join("");
              } else {
                contentText = String(chunk.content);
              }

              controller.enqueue(encoder.encode(contentText));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(encoder.encode("[ERROR]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Internal server error",
        errors: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
