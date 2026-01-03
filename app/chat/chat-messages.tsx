"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon, FileText, ChevronDown } from "lucide-react";
import { usePdfStore } from "../store";

export default function ChatMessages() {
  const { messages } = usePdfStore();

  // Empty / onboarding state
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Upload a PDF and ask a question to begin.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4">
      <div className="flex flex-col gap-4 py-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <Card className="max-w-[75%] rounded-2xl">
                <CardContent className="px-4 py-3 space-y-2 text-sm leading-relaxed">
                  {/* Message content / thinking state */}
                  {msg.isThinking ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      <span>Thinking…</span>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}

                  {/* Sources – assistant only, not while thinking */}
                  {!isUser &&
                    !msg.isThinking &&
                    msg.sources &&
                    msg.sources.length > 0 && (
                      <>
                        <Separator />
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            Sources ({msg.sources.length})
                            <ChevronDown className="h-3.5 w-3.5" />
                          </CollapsibleTrigger>

                          <CollapsibleContent className="mt-2 space-y-2">
                            {msg.sources.map((s, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                              >
                                <span className="truncate">{s.fileName}</span>

                                <Badge variant="secondary">Page {s.page}</Badge>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
