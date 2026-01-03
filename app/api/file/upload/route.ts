import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { inngest } from "@/app/inngest/client";
import { db } from "@/db";
import { docSchema } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `pdf-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const [doc] = await db
      .insert(docSchema)
      .values({
        userId: user?.id as string,
        fileName,
        filePath,
        status: "queued",
      })
      .returning();

    await inngest.send({
      name: "pdf/uploaded",
      data: {
        documentId: doc.id,
        fileName,
        filePath,
      },
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded",
      documentId: doc.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
