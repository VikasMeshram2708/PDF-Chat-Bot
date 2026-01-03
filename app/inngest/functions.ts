import { inngest } from "./client";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "@/app/env";
import { db } from "@/db";
import { docSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

export const processPDF = inngest.createFunction(
  { id: "process_pdf" },
  { event: "pdf/uploaded" },

  async ({ event, step }) => {
    const { documentId, fileName, filePath } = event.data;

    try {
      // processing
      await db
        .update(docSchema)
        .set({
          status: "processing",
        })
        .where(eq(docSchema.id, documentId));

      const chunkCount = await step.run("parse_and_embed_pdf", async () => {
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });

        const splitDocs = await splitter.splitDocuments(docs);

        const embeddings = new GoogleGenerativeAIEmbeddings({
          model: "text-embedding-004",
          apiKey: env.GOOGLE_API_KEY,
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
          embeddings,
          {
            url: env.QUADRANT_URL,
            apiKey: env.QUADRANT_API_KEY,
            collectionName: "PDF Chat Bot",
          }
        );

        await vectorStore.addDocuments(splitDocs);

        return splitDocs.length;
      });

      await db
        .update(docSchema)
        .set({
          status: "completed",
        })
        .where(eq(docSchema.id, documentId));

      // EMIT COMPLETION EVENT
      await step.sendEvent("emit_completion", {
        name: "pdf/ingest.completed",
        data: {
          documentId,
          fileName,
          chunks: chunkCount,
        },
      });

      return { success: true };
    } catch (error) {
      // EMIT FAILURE EVENT
      await db
        .update(docSchema)
        .set({
          status: "failed",
        })
        .where(eq(docSchema.id, documentId));

      await step.sendEvent("emit_failure", {
        name: "pdf/ingest.failed",
        data: {
          documentId,
          fileName,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }
);
