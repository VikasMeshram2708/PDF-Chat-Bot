"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2Icon, SendIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { usePdfStore } from "../store";

/* backend source type (already global in your env.d.ts) */
interface Source {
  source: string;
  loc: {
    pageNumber: number;
  };
}

export default function ChatBox() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { addMessage, updateMessage, removeMessage } = usePdfStore();

  async function handleForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // 1️⃣ User message
    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue,
    });

    // 2️⃣ Assistant placeholder (will stream into this)
    const assistantId = crypto.randomUUID();
    addMessage({
      id: assistantId,
      role: "assistant",
      content: "",
      isThinking: true,
    });

    const question = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/file/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: question }),
      });

      if (!res.body) {
        throw new Error("Streaming not supported by response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let accumulated = "";

      // 3️⃣ STREAM TOKENS
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        updateMessage(assistantId, accumulated);
      }

      // remove thinking flag after stream ends
      updateMessage(assistantId, accumulated);
    } catch (err) {
      removeMessage(assistantId);
      toast.error(
        err instanceof Error ? err.message : "Failed to stream response"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleForm} className="flex items-center gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ask a question about your document…"
        className="h-11 sm:h-12 rounded-xl"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <SendIcon className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
