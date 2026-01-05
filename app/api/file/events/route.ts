import { NextRequest } from "next/server";
import { jobEvents } from "@/lib/job-events";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  console.log("LISTENING FOR", jobId);

  if (!jobId) {
    return new Response("Missing jobId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 🔥 FORCE FLUSH (critical)
      controller.enqueue(encoder.encode(`: connected\n\n`));

      const handler = () => {
        console.log("SSE EVENT FIRED FOR", jobId);

        controller.enqueue(encoder.encode(`data: {"status":"ready"}\n\n`));
        controller.close();
      };

      jobEvents.once(jobId, handler);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
