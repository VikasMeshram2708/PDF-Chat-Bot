export type iMessage = {
  role: "user" | "assistant";
  text: string;
  metadata?: {
    publishedAt: Date | string;
  };
};

export const sampleMessages: iMessage[] = [
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
  {
    role: "user",
    text: "Upload complete.",
    metadata: { publishedAt: "2026-01-02T13:00:00Z" },
  },
  {
    role: "assistant",
    text: "Parsing document…",
    metadata: { publishedAt: "2026-01-02T13:00:01Z" },
  },
  {
    role: "assistant",
    text: "Generating embeddings…",
    metadata: { publishedAt: "2026-01-02T13:00:03Z" },
  },
  {
    role: "assistant",
    text: "Indexing complete. You can start asking questions.",
    metadata: { publishedAt: "2026-01-02T13:00:05Z" },
  },
];
