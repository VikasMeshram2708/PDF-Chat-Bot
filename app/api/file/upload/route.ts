import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { jobEvents } from "@/lib/job-events";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    console.log("s", file);
    // sanitization
    if (!file) {
      return NextResponse.json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // directory for file uploads
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `pdf-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);
    // IMPORTANT
    const jobId = crypto.randomUUID();

    // inngest call simulation
    processPdfAsync(jobId);
    // respond
    return NextResponse.json({
      success: true,
      jobId,
      message: "File uploaded",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Internal server error",
      error: (error as Error).message,
    });
  }
}

async function processPdfAsync(jobId: string) {
  await new Promise((r) => setTimeout(r, 5000)); // simulate ingestion
  console.log("EMITTING EVENT FOR", jobId);
  jobEvents.emit(jobId); // 🔔 event AFTER client subscribes
}
