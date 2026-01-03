import { env } from "@/app/env";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as z from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chatMessageSchema } from "@/db/schema";

const querySchema = z.object({
  q: z.string().min(1, "Query is required").max(200, "Query is too long..."),
});

type QuerySchema = z.infer<typeof querySchema>;

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

// Helper function to correct spelling mistakes using AI
async function correctSpelling(query: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Correct any spelling mistakes in the following query while keeping the meaning and intent exactly the same. Only return the corrected query, nothing else. If there are no mistakes, return the query as-is.

Query: "${query}"

Corrected query:`,
            },
          ],
        },
      ],
    });

    const corrected = response.text.trim();
    // If the response looks reasonable, use it; otherwise fall back to original
    if (corrected.length > 0 && corrected.length < query.length * 2) {
      return corrected;
    }
    return query;
  } catch (error) {
    console.error("Error correcting spelling:", error);
    // Fall back to original query if spell check fails
    return query;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

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

    let { q } = parsed.data;
    const originalQuery = q;

    // Correct spelling mistakes automatically
    q = await correctSpelling(q);

    // Save user query to database (save original query as user typed it)
    try {
      await db.insert(chatMessageSchema).values({
        userId: user.id,
        role: "user",
        content: originalQuery, // Save what user actually typed
      });
    } catch (dbError: any) {
      console.error("Error saving user message to database:", {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        userId: user.id,
        contentLength: originalQuery.length,
      });
      // Continue processing even if DB save fails
    }
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

    // Use corrected query for search and AI processing
    const results = await vectorStore.similaritySearch(q, 2);
    const context = results
      .map((doc, i) => `Source ${i + 1}:\n${doc.pageContent}`)
      .join("\n\n");

    // Response
    const stream = await ai.models.generateContentStream({
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

    const encoder = new TextEncoder();
    let accumulatedResponse = "";

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.text;
              // console.log("SERVER CHUNK:", text);
              if (text) {
                accumulatedResponse += text;
                controller.enqueue(encoder.encode(text));
              }
            }

            // Save assistant response to database after streaming completes
            if (accumulatedResponse.trim()) {
              try {
                await db.insert(chatMessageSchema).values({
                  userId: user.id,
                  role: "assistant",
                  content: accumulatedResponse.trim(),
                });
              } catch (dbError: any) {
                console.error("Error saving assistant message to database:", {
                  error: dbError,
                  message: dbError?.message,
                  stack: dbError?.stack,
                  userId: user.id,
                  contentLength: accumulatedResponse.trim().length,
                });
                // Don't fail the request if DB save fails
              }
            }

            controller.close();
          } catch (error) {
            const err = error as Error;
            controller.error(err.message);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      }
    );

    // return NextResponse.json({
    //   success: true,
    //   answer: response.text,
    //   sources: results.map((r) => r.metadata),
    // });
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
