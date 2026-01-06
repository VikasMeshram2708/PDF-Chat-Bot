import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { inngest } from "@/app/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    // console.log("server-rec", file);

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

    // return processing response
    NextResponse.json({
      success: true,
      message: "File processing...",
    });

    const documentId = crypto.randomUUID();

    // inngest call
    await inngest.send({
      name: "upload/file",
      data: {
        fileName: file.name,
        filePath: filePath,
        documentId: documentId,
      },
    });

    // respond
    return NextResponse.json({
      success: true,
      //   jobId,
      message: "File uploaded",
      documentId,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Internal server error",
      error: (error as Error).message,
    });
  }
}
