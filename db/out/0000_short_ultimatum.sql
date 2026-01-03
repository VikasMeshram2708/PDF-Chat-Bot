CREATE TYPE "public"."document_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"filePath" varchar(500) NOT NULL,
	"userId" text NOT NULL,
	"status" "document_status" DEFAULT 'queued',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "doc_user_idx" ON "documents" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "doc_status_idx" ON "documents" USING btree ("status");