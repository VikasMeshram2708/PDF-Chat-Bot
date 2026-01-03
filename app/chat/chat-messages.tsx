"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { sampleMessages } from "./mocked-messages";
import { BotIcon, UserCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

export function ChatMessages() {
  const { user } = useUser();
  const userName = `${user?.firstName} ${user?.lastName}`;

  return (
    <section className="w-full h-full">
      <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold text-center">
        Hello,
        <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-500 via-blue-500 to-pink-500">
          {" "}
          {userName ?? "Anon"}
        </span>
      </h2>
      <ScrollArea className="h-[73vh] px-4 py-6">
        <div className="flex flex-col gap-4">
          {sampleMessages.map((msg, index) => {
            const isAssistant = msg.role === "assistant";

            return (
              <div
                key={`${msg.role}-${index}`}
                className={cn(
                  "flex w-full items-end gap-3",
                  isAssistant ? "justify-start" : "justify-end"
                )}
              >
                {/* Assistant icon (left) */}
                {isAssistant && (
                  <div className="shrink-0 text-muted-foreground">
                    <BotIcon size={20} />
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                    isAssistant
                      ? "bg-secondary text-secondary-foreground rounded-bl-none"
                      : "bg-primary text-primary-foreground rounded-br-none"
                  )}
                >
                  {msg.text}
                </div>

                {/* User icon (right) */}
                {!isAssistant && (
                  <div className="shrink-0 text-muted-foreground">
                    <UserCircleIcon size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
}
