import { create } from "zustand";
import { persist } from "zustand/middleware";

type InitialState = {
  answers: Array<string>;
  addAnswers: (answer: string) => void;
  clearAnswers: () => void;
};

export const usePdfStore = create<InitialState>()(
  persist(
    (set) => ({
      answers: [],
      addAnswers: (answer) =>
        set((state) => ({
          answers: [...state.answers, answer],
        })),
      clearAnswers: () => set({ answers: [] }),
    }),
    {
      name: "pdf_chat_bot",
    }
  )
);
