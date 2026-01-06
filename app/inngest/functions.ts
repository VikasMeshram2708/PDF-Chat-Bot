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
  async ({ event, step }) => {
    const { fileName, filePath, documentId } = event.data;
    console.log("documentId", documentId);

    if (!fileName || !filePath) {
      throw new Error("Invalid file data");
    }

    // load pdf
    const loader = new PDFLoader(filePath, { splitPages: true });
    const pages = await loader.load();

    // split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
      separators: ["\n\n", "\n", ". ", " "],
    });

    const chunks = await splitter.splitDocuments(pages);
    // metadata
    chunks.forEach((doc, index) => {
      doc.metadata = {
        ...doc.metadata,
        source: fileName ?? filePath,
        chunkIndex: index,
      };
    });

    // connect to qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: env.QDRANT_URL,
        apiKey: env.QDRANT_DB_API_KEY,
        collectionName: "pdf_bot",
      }
    );

    await vectorStore.addDocuments(chunks);

    return { success: true };
  }
);

export const functions = [fileUpload];
