"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon, SendIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { usePdfStore } from "../store";

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
    <form onSubmit={handleForm} className="relative">
      <div className="relative flex items-end rounded-2xl border border-border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !isLoading &&
              inputValue.trim()
            ) {
              e.preventDefault();
              const form = e.currentTarget.form;
              if (form) {
                const submitEvent = new Event("submit", {
                  bubbles: true,
                  cancelable: true,
                });
                form.dispatchEvent(submitEvent);
              }
            }
          }}
          placeholder="Message PDF Chat..."
          className="w-full resize-none bg-transparent px-4 py-3 pr-12 text-sm leading-6 focus:outline-none disabled:opacity-50 max-h-32 overflow-y-auto"
          rows={1}
          disabled={isLoading}
          style={{
            height: "auto",
            minHeight: "52px",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          size="icon"
          className="absolute right-2 bottom-2 h-8 w-8 rounded-lg shrink-0"
        >
          {isLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        PDF Chat can make mistakes. Check important info.
      </p>
    </form>
  );
}
