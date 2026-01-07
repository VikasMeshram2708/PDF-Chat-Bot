import { env } from "../env";
import { inngest } from "./client";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});

export const fileUpload = inngest.createFunction(
  {
    id: "file-upload",
    rateLimit: {
      limit: 5,
      period: "1m",
    },
  },
  { event: "upload/file" },
  async ({ event }) => {
    const { fileName, fileUrl } = event.data;

    if (!fileName || !fileUrl) {
      throw new Error("Invalid file data");
    }

    // 1. Download the PDF from the Vercel Blob URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // 2. Convert to Blob for PDFLoader
    const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });

    // 3. Load PDF from blob
    const loader = new PDFLoader(pdfBlob, { splitPages: true });
    const pages = await loader.load();

    // 4. Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
      separators: ["\n\n", "\n", ". ", " "],
    });

    const chunks = await splitter.splitDocuments(pages);

    // 5. Add metadata per chunk
    chunks.forEach((doc, index) => {
      doc.metadata = {
        ...doc.metadata,
        source: fileName ?? fileUrl,
        chunkIndex: index,
      };
    });

    // 6. Connect to Qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: env.QDRANT_URL,
        apiKey: env.QDRANT_DB_API_KEY,
        collectionName: "pdf_bot",
      }
    );

    // 7. Store chunks in vector DB
    await vectorStore.addDocuments(chunks);

    return { success: true };
  }
);

export const functions = [fileUpload];
