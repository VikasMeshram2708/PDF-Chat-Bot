import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { inngest } from "@/app/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // ✅ Validate PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // ✅ Create uploads directory
    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Generate filename
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `pdf-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // ✅ Save file
    fs.writeFileSync(filePath, buffer);

    // ingest trigger
    await inngest.send({
      name: "pdf/uploaded",
      data: {
        fileName,
        filePath,
      },
    });
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      fileName,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
