"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon, FileText, ChevronDown, User, Bot } from "lucide-react";
import { usePdfStore } from "../store";
import { useEffect, useRef } from "react";

export default function ChatMessages() {
  const { messages } = usePdfStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Empty / onboarding state
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="size-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">How can I help you today?</h3>
            <p className="text-sm text-muted-foreground">
              Upload a PDF document and ask questions about it to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isUser ? (
                <User className="size-4" />
              ) : (
                <Bot className="size-4" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${isUser ? "flex justify-end" : ""}`}>
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {/* Message content / thinking state */}
                {msg.isThinking ? (
                  <div className="flex items-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <span>Thinking…</span>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed m-0">
                      {msg.content}
                    </p>
                  </div>
                )}

                {/* Sources – assistant only, not while thinking */}
                {!isUser &&
                  !msg.isThinking &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <>
                      <Separator className="my-3 bg-border/50" />
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2 text-xs opacity-80 hover:opacity-100 transition-opacity w-full">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Sources ({msg.sources.length})</span>
                          <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-2 space-y-2">
                          {msg.sources.map((s, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2 text-xs"
                            >
                              <span className="truncate flex-1">
                                {s.fileName}
                              </span>
                              <Badge variant="secondary" className="ml-2">
                                Page {s.page}
                              </Badge>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
