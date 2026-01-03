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

  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  removeMessage: (id: string) => void;
  clearChat: () => void;
};

/* =========================
   STORE IMPLEMENTATION
   ========================= */
export const usePdfStore = create<PdfChatStore>()(
  persist(
    (set) => ({
      messages: [],

      /* Add a new message */
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

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
      clearChat: () => set({ messages: [] }),
    }),
    {
      name: "pdf_chat_bot",
    }
  )
);
