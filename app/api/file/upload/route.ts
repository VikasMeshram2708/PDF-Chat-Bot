import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";
import { put } from "@vercel/blob";

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
    // const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Vercel Blob
    const uploaded = await put(`pdf-${Date.now()}.pdf`, buffer, {
      access: "public",
      contentType: "application/pdf",
    });

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
        fileUrl: uploaded.url,
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
