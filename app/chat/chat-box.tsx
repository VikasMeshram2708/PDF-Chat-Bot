"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, StopCircle } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type iMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
};

export function ChatBox() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<iMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, isStreaming]);

  const addMessage = useCallback((msg: iMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateMessageText = useCallback(
    (id: string, text: string, streaming = false) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text, streaming } : m))
      );
    },
    []
  );

  // In chat-box.tsx, simplify the handleSubmit function:

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const userMsg: iMessage = {
      id: String(Date.now()) + "-u",
      role: "user",
      text: inputValue.trim(),
    };

    addMessage(userMsg);
    setInputValue("");

    // create assistant placeholder message so we can stream into it
    const assistantId = String(Date.now()) + "-a";
    const assistantMsg: iMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      streaming: true,
    };
    addMessage(assistantMsg);

    setIsStreaming(true);
    controllerRef.current = new AbortController();
    try {
      const res = await fetch("/api/file/query", {
        body: JSON.stringify({ text: userMsg.text }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controllerRef.current.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        updateMessageText(assistantId, `Error: ${text}`, false);
        setIsStreaming(false);
        toast.error("Failed to get a response. Please try again.");
        return;
      }

      // If there's no body (non-streaming), read the full text
      if (!res.body) {
        const full = await res.text();
        updateMessageText(assistantId, full, false);
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        updateMessageText(assistantId, accumulated, true);
      }

      // Simple cleanup - just normalize whitespace
      const finalText = accumulated.replace(/\s+/g, " ").trim();
      updateMessageText(assistantId, finalText, false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        updateMessageText(assistantId, "(stopped)", false);
      } else {
        console.error("Streaming error:", err);
        updateMessageText(
          assistantId,
          "Something went wrong. Please try again.",
          false
        );
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsStreaming(false);
      controllerRef.current = null;
    }
  }

  function stopStream() {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto p-4">
      <div className="border rounded-lg p-6 mb-4 bg-card shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chat</h2>
          {messages.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div
          ref={containerRef}
          className="h-[400px] overflow-y-auto space-y-4 p-4 rounded-lg border bg-background"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="text-muted-foreground">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 opacity-50"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                    <path d="M14 9a5 5 0 0 0-5-5" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Start a conversation — ask something about your files.
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Your questions will be answered based on the uploaded
                  documents.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                      {m.text || (m.streaming ? <TypingIndicator /> : "")}
                    </div>
                    {m.streaming && (
                      <div className="mt-2 text-xs opacity-70">
                        AI is thinking...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={
              isStreaming
                ? "AI is responding..."
                : "Ask about your documents..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isStreaming}
            aria-label="Ask something about your documents"
            className="pr-24"
          />
          {inputValue && !isStreaming && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs"
                disabled={!inputValue.trim()}
              >
                Send
                <SendIcon className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {isStreaming && (
          <Button
            variant="destructive"
            onClick={stopStream}
            type="button"
            aria-label="Stop generating"
            className="gap-2"
          >
            <StopCircle className="h-4 w-4" />
            Stop
          </Button>
        )}
      </form>
    </section>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="sr-only">AI is typing</span>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-pulse delay-150" />
        <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-pulse delay-300" />
      </div>
    </div>
  );
}
