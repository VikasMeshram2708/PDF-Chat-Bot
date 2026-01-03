"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePdfStore } from "../store";
import axios from "axios";
import { toast } from "sonner";

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
};

interface Conversation {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
}

export default function ChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { clearChat, messages, setConversationStartTime } = usePdfStore();

  const fetchHistory = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const res = await axios.get("/api/chat/history");
      if (res.data?.success) {
        const convs = res.data.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          lastMessageAt: conv.lastMessageAt,
          messageCount: conv.messages.length,
        }));
        setConversations(convs);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchHistory(true);

    // Refresh history silently in background (less frequently)
    const interval = setInterval(() => {
      fetchHistory(false); // Silent refresh
    }, 30000); // Refresh every 30 seconds instead of 5

    return () => clearInterval(interval);
  }, []);

  // Refresh when messages are added (but silently)
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DB has saved the message
      const timeout = setTimeout(() => {
        fetchHistory(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [messages.length]);

  const handleNewChat = () => {
    clearChat();
    setSelectedConversationId(null);
    // Set a new conversation start time to ensure messages are separated
    setConversationStartTime(new Date().toISOString());
  };

  const handleLoadConversation = async (conversationId: string) => {
    try {
      const res = await axios.post("/api/chat/load", {
        conversationId,
      });

      if (res.data?.success) {
        // Convert DB messages to store format
        const storeMessages = res.data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          isThinking: false,
        }));

        // Clear current chat and load conversation
        clearChat();
        storeMessages.forEach((msg: any) => {
          usePdfStore.getState().addMessage(msg);
        });

        setSelectedConversationId(conversationId);
        // Set conversation start time to the first message time
        if (storeMessages.length > 0) {
          // Find the first message timestamp from the loaded conversation
          const firstMessage = res.data.messages[0];
          if (firstMessage?.createdAt) {
            setConversationStartTime(firstMessage.createdAt);
          }
        }
        toast.success("Conversation loaded");
      }
    } catch (error: any) {
      console.error("Error loading conversation:", error);
      toast.error(
        error.response?.data?.message || "Failed to load conversation"
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No chat history yet
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group ${
                    selectedConversationId === conv.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
