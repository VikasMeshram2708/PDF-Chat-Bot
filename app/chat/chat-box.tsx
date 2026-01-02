"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2Icon, SendIcon } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { usePdfStore } from "../store";

export default function ChatBox() {
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const { addAnswers } = usePdfStore();

  function handleForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await axios.post("/api/file/chat", {
          q: inputValue,
        });
        const data: RetrievalResponse = await res.data;
        if (!data.success) {
          toast.error("Failed");
          return;
        }
        addAnswers(data.answer);
      } catch (error) {
        toast.error("Something went wrong. Internal server error.");
      }
    });
  }
  return (
    <form onSubmit={handleForm} className="flex items-center gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ask a question about your document…"
        className="h-11 sm:h-12 rounded-xl"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
      </Button>
    </form>
  );
}
