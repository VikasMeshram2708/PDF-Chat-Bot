"use client";

import { useEffect, useRef } from "react";
import { usePdfStore } from "../store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatMessages() {
  const { answers } = usePdfStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answers]);

  if (answers.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Ask a question to start chatting with your document.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="flex flex-col gap-3 py-4">
        {answers.map((answer, index) => (
          <div key={index} className="flex justify-start">
            <Card className="max-w-[75%] rounded-2xl">
              <CardContent className="px-4 py-3 text-sm leading-relaxed">
                {answer}
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
