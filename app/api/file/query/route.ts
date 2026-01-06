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

type querySchema = z.infer<typeof querySchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // sanitize
    const parsed = querySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid data",
        error: parsed.error.issues.map(
          (issue) =>
            `error occurred at :${issue.path.join(".")} of ${issue.message}`
        ),
      });
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

    const similarityResults = await vectorStore.similaritySearch(text, 2);

    const context = similarityResults
      .map((doc, i) => `Source ${i + 1}:\n${doc.pageContent}`)
      .join("\n\n");

    const res = await llm.invoke([
      new HumanMessage(`You are a PDF assistant. 
    Answer the question using ONLY the context below.
    If the answer is not present, say you don't know.
    Context: ${context}
    Question: ${text}`),
      new SystemMessage(
        "You are a highly intelligent question answering bot. If you are unable to answer the question, please truthfully say you don't know."
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: res.content,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Internal server error",
      errors: (error as Error).message,
    });
  }
}
