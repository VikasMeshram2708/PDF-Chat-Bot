"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { useState } from "react";

export function ChatBox() {
  const [inputValue, setInputValue] = useState("");
  return (
    <section>
      <form className="flex items-center gap-3">
        <Input
          type="text"
          placeholder="Ask"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button type="submit" disabled={!inputValue.trim()}>
          <SendIcon />
        </Button>
      </form>
    </section>
  );
}
