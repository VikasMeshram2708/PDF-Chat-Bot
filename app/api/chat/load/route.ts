import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chatMessageSchema } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // Get the conversation start message to find the time range
    const startMessage = await db
      .select()
      .from(chatMessageSchema)
      .where(
        and(
          eq(chatMessageSchema.id, conversationId),
          eq(chatMessageSchema.userId, user.id)
        )
      )
      .limit(1);

    if (startMessage.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation not found",
        },
        {
          status: 404,
        }
      );
    }

    const conversationStart = new Date(startMessage[0].createdAt);
    const conversationEnd = new Date(
      conversationStart.getTime() + 10 * 60 * 1000
    ); // 10 minutes

    // Get all messages in this conversation time range
    const messages = await db
      .select()
      .from(chatMessageSchema)
      .where(
        and(
          eq(chatMessageSchema.userId, user.id),
          gte(chatMessageSchema.createdAt, conversationStart.toISOString()),
          lte(chatMessageSchema.createdAt, conversationEnd.toISOString())
        )
      )
      .orderBy(chatMessageSchema.createdAt);

    return NextResponse.json({
      success: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load conversation",
      },
      {
        status: 500,
      }
    );
  }
}
