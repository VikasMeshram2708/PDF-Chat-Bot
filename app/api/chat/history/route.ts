import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chatMessageSchema } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
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

    // Get all messages for the user, ordered by creation time
    const messages = await db
      .select()
      .from(chatMessageSchema)
      .where(eq(chatMessageSchema.userId, user.id))
      .orderBy(desc(chatMessageSchema.createdAt))
      .limit(1000); // Limit to recent 1000 messages

    // Group messages into conversations
    // A conversation is a series of messages with less than 30 minutes gap
    const conversations: Array<{
      id: string;
      title: string;
      messages: typeof messages;
      lastMessageAt: string;
    }> = [];

    let currentConversation: typeof messages = [];
    let lastMessageTime: Date | null = null;

    for (const message of messages) {
      const messageTime = new Date(message.createdAt);

      // If this is the first message or gap is more than 10 minutes, start new conversation
      // Reduced from 30 to 10 minutes to better separate conversations
      if (
        !lastMessageTime ||
        (lastMessageTime.getTime() - messageTime.getTime()) / (1000 * 60) > 10
      ) {
        // Save previous conversation if it exists
        if (currentConversation.length > 0) {
          const firstUserMessage = currentConversation.find(
            (m) => m.role === "user"
          );
          const title =
            firstUserMessage?.content.slice(0, 30).trim() || "New Chat";
          conversations.push({
            id: currentConversation[0].id,
            title:
              firstUserMessage && firstUserMessage.content.length > 30
                ? title + "..."
                : title,
            messages: [...currentConversation],
            lastMessageAt: currentConversation[0].createdAt,
          });
        }
        // Start new conversation
        currentConversation = [message];
      } else {
        // Add to current conversation
        currentConversation.unshift(message); // Add to beginning to maintain chronological order
      }

      lastMessageTime = messageTime;
    }

    // Add the last conversation
    if (currentConversation.length > 0) {
      const firstUserMessage = currentConversation.find(
        (m) => m.role === "user"
      );
      const title = firstUserMessage?.content.slice(0, 30).trim() || "New Chat";
      conversations.push({
        id: currentConversation[0].id,
        title:
          firstUserMessage && firstUserMessage.content.length > 30
            ? title + "..."
            : title,
        messages: [...currentConversation],
        lastMessageAt: currentConversation[0].createdAt,
      });
    }

    // Sort conversations by last message time (most recent first)
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );

    return NextResponse.json({
      success: true,
      conversations: conversations.slice(0, 50), // Limit to 50 most recent conversations
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chat history",
      },
      {
        status: 500,
      }
    );
  }
}
