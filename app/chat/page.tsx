import { Input } from "@/components/ui/input";
import { UploadIcon } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Upload Area */}
        <aside className="lg:w-[320px] shrink-0">
          <section className="relative rounded-2xl border border-gray-400 bg-secondary/40 p-6 sm:p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="rounded-full border border-primary bg-background p-4">
                <UploadIcon className="size-8 sm:size-9" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Upload your PDF</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Drag & drop or click to select a file
                </p>
              </div>
            </div>
          </section>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 min-h-[60vh] flex flex-col rounded-2xl border border-gray-400 bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* messages here */}
          </div>

          {/* Input */}
          <div className="border-t border-gray-400 p-3 sm:p-4">
            <Input
              placeholder="Ask a question about your document…"
              className="h-11 sm:h-12 rounded-xl"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
