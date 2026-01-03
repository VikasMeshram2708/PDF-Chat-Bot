import { NextRequest } from "next/server";
import { db } from "@/db";
import { docSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ documentId: string }> | { documentId: string } }
) {
  // Handle both sync and async params (Next.js 15+ compatibility)
  const resolvedParams = await Promise.resolve(params);
  const { documentId } = resolvedParams;

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastStatus: string | null = null;
      let retryCount = 0;
      const MAX_RETRIES = 5; // Retry up to 5 times if document not found initially
      let pollInterval: NodeJS.Timeout | null = null;

      // Helper function to find document with retry logic
      const findDocument = async (): Promise<
        typeof docSchema.$inferSelect | null
      > => {
        try {
          const [doc] = await db
            .select()
            .from(docSchema)
            .where(eq(docSchema.id, documentId))
            .limit(1);

          return doc || null;
        } catch (error) {
          console.error("Error querying document:", error);
          return null;
        }
      };

      // Initial delay to allow DB transaction to commit (race condition fix)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Initial document lookup with retry logic
      let doc = await findDocument();

      // Retry if document not found (handles race condition)
      while (!doc && retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 500 * retryCount));
        doc = await findDocument();
      }

      // If document still not found after retries, close connection silently
      // Don't send error to client as it might be a transient issue
      if (!doc) {
        console.warn(
          `Document ${documentId} not found after ${MAX_RETRIES} retries`
        );
        controller.close();
        return;
      }

      // Send initial status if available
      // Always send the current status so client knows the state
      if (doc.status) {
        lastStatus = doc.status;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "status",
              status: doc.status,
              fileName: doc.fileName,
            })}\n\n`
          )
        );

        // If already completed or failed, close immediately
        if (doc.status === "completed" || doc.status === "failed") {
          controller.close();
          return;
        }
      }

      // Poll the database for status changes
      pollInterval = setInterval(async () => {
        try {
          const currentDoc = await findDocument();

          if (!currentDoc) {
            // Document disappeared - close silently (shouldn't happen in normal flow)
            if (pollInterval) clearInterval(pollInterval);
            controller.close();
            return;
          }

          // Only send update if status actually changed
          if (currentDoc.status !== lastStatus) {
            lastStatus = currentDoc.status;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "status",
                  status: currentDoc.status,
                  fileName: currentDoc.fileName,
                })}\n\n`
              )
            );

            // If completed or failed, close the connection
            if (
              currentDoc.status === "completed" ||
              currentDoc.status === "failed"
            ) {
              if (pollInterval) clearInterval(pollInterval);
              controller.close();
            }
          }
        } catch (error) {
          console.error("Error polling document status:", error);
          // Don't send error to client, just log and continue polling
          // Only close on repeated failures or client disconnect
        }
      }, 1000); // Poll every 1 second to catch status changes faster

      // Clean up on client disconnect
      req.signal.addEventListener("abort", () => {
        if (pollInterval) clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
