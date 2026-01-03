import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const documentStatusEnum = pgEnum("document_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const timeStamps = {
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true,
  }).defaultNow(),
};

export const docSchema = pgTable(
  "documents",
  {
    id: uuid().defaultRandom().primaryKey(),
    fileName: varchar({ length: 255 }).notNull(),
    filePath: varchar({ length: 500 }).notNull(),
    userId: text().notNull(),
    status: documentStatusEnum().default("queued"),
    ...timeStamps,
  },
  (d) => [
    index("doc_user_idx").on(d.userId),
    index("doc_status_idx").on(d.status),
  ]
);

export const chatMessageSchema = pgTable(
  "chat_messages",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text().notNull(),
    role: varchar({ length: 20 }).notNull(), // 'user' or 'assistant'
    content: text().notNull(),
    documentId: uuid(), // Optional: link to document if query is about a specific document
    ...timeStamps,
  },
  (d) => [
    index("chat_user_idx").on(d.userId),
    index("chat_document_idx").on(d.documentId),
    index("chat_created_idx").on(d.createdAt),
  ]
);
