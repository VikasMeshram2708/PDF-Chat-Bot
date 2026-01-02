import { inngest } from "./client";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "@/app/env";

export const processPDF = inngest.createFunction(
  { id: "process_pdf" },
  { event: "pdf/uploaded" },

  async ({ event, step }) => {
    const { fileName, filePath } = event.data;

    await step.run("parse_and_embed_pdf", async () => {
      console.log("Processing PDF:", fileName);

      /** 1️⃣ Load PDF */
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      console.log("docs", docs);

      /** 2️⃣ Split text */
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await splitter.splitDocuments(docs);
      console.log("splitDocs", splitDocs);

      /** 3️⃣ Create embeddings (LAZY) */
      const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey: env.GOOGLE_API_KEY,
      });

      /** 4️⃣ Connect to Qdrant */
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: env.QUADRANT_URL, // endpoint
          apiKey: env.QUADRANT_API_KEY, // key (cloud only)
          collectionName: "PDF Chat Bot",
        }
      );

      /** 5️⃣ Store embeddings */
      await vectorStore.addDocuments(splitDocs);

      console.log("Stored", splitDocs.length, "chunks");
    });

    return { success: true };
  }
);
