import { create } from "zustand";
import { persist } from "zustand/middleware";

/* =========================
   UI-SAFE SOURCE TYPE
   ========================= */
export type UiSource = {
  fileName: string;
  page: number;
};

/* =========================
   CHAT MESSAGE TYPE
   ========================= */
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: UiSource[];
  isThinking?: boolean;
};

/* =========================
   STORE SHAPE
   ========================= */
type PdfChatStore = {
  messages: ChatMessage[];
  conversationStartTime: string | null; // Timestamp when current conversation started

  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  removeMessage: (id: string) => void;
  clearChat: () => void;
  setConversationStartTime: (time: string | null) => void;
};

/* =========================
   STORE IMPLEMENTATION
   ========================= */
export const usePdfStore = create<PdfChatStore>()(
  persist(
    (set) => ({
      messages: [],
      conversationStartTime: null,

      /* Add a new message */
      addMessage: (message) =>
        set((state) => {
          // If this is the first message and no conversation start time, set it
          const isFirstMessage = state.messages.length === 0;
          const newStartTime =
            isFirstMessage && !state.conversationStartTime
              ? new Date().toISOString()
              : state.conversationStartTime;

          return {
            messages: [...state.messages, message],
            conversationStartTime: newStartTime,
          };
        }),

      /* Update message content (used for streaming) */
      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id
              ? {
                  ...m,
                  content,
                  isThinking: false, // stop thinking once streaming starts
                }
              : m
          ),
        })),

      /* Remove a message (used to delete thinking placeholder on error) */
      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),

      /* Clear entire chat */
      clearChat: () => set({ messages: [], conversationStartTime: null }),

      /* Set conversation start time */
      setConversationStartTime: (time) => set({ conversationStartTime: time }),
    }),
    {
      name: "pdf_chat_bot",
    }
  )
);
