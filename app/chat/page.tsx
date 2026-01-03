import ChatBox from "./chat-box";
import ChatMessages from "./chat-messages";
import UploadArea from "./upload-area";
import ChatHistory from "./chat-history";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Left Sidebar - Desktop only */}
      <aside className="hidden lg:flex lg:w-64 xl:w-80 shrink-0 border-r border-border bg-sidebar overflow-hidden flex-col">
        {/* Upload Area */}
        <div className="p-4 border-b border-border">
          <UploadArea />
        </div>
        {/* Chat History */}
        <div className="flex-1 min-h-0">
          <ChatHistory />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Mobile Upload Area - Show at top on mobile */}
        <div className="lg:hidden border-b border-border bg-sidebar p-4">
          <UploadArea />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-4 lg:py-8">
            <ChatMessages />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 py-3 lg:py-4">
            <ChatBox />
          </div>
        </div>
      </main>
    </div>
  );
}
