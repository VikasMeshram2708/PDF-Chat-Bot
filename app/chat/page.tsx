import { ChatBox } from "./chat-box";
import { ChatMessages } from "./chat-messages";
import { UploadArea } from "./upload-area";

export default function ChatPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="flex justify-between gap-10">
        {/* upload area  */}
        <UploadArea />
        <div className="flex flex-col gap-2 w-full">
          {/* chat messages */}
          <ChatMessages />
          {/* chatbox */}
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
