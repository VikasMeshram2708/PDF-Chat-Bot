import ChatBox from "./chat-box";
import UploadArea from "./upload-area";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Upload Area */}
        <UploadArea />
        {/* Chat Area */}
        <main className="flex-1 min-h-[60vh] flex flex-col rounded-2xl border border-gray-400 bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* messages here */}
          </div>

          {/* Input */}
          <div className="border-t border-gray-400 p-3 sm:p-4">
            <ChatBox />
          </div>
        </main>
      </div>
    </div>
  );
}
