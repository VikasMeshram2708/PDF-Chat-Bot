import { env } from "@/app/env";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as z from "zod";

const querySchema = z.object({
  q: z.string().min(1, "Query is required").max(200, "Query is too long..."),
});

type QuerySchema = z.infer<typeof querySchema>;

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // parse
    const parsed = querySchema.safeParse(body);
    console.log(
      "e",
      parsed.error?.issues.map((i) => `error at : ${i.path} - ${i.message}}`)
    );
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error?.issues.map(
            (i) => `error at : ${i.path} - ${i.message}}`
          ),
        },
        {
          status: 400,
        }
      );
    }

    const { q } = parsed.data;
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: env.GOOGLE_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: env.QUADRANT_URL, // endpoint
        apiKey: env.QUADRANT_API_KEY, // key (cloud only)
        collectionName: "PDF Chat Bot",
      }
    );

    const results = await vectorStore.similaritySearch(parsed.data.q, 2);
    const context = results
      .map((doc, i) => `Source ${i + 1}:\n${doc.pageContent}`)
      .join("\n\n");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
  You are a PDF assistant.
  Answer the question using ONLY the context below.
  If the answer is not present, say you don't know.
  
  Context:
  ${context}
  
  Question:
  ${q}
                `,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      answer: response.text,
      sources: results.map((r) => r.metadata),
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: err?.message,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
