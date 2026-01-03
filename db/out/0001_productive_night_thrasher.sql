CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"documentId" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "chat_user_idx" ON "chat_messages" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chat_document_idx" ON "chat_messages" USING btree ("documentId");--> statement-breakpoint
CREATE INDEX "chat_created_idx" ON "chat_messages" USING btree ("created_at");