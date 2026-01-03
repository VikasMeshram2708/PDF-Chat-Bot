"use client";

import { motion } from "motion/react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl px-6 py-24"
      >
        <h1 className="text-4xl font-semibold tracking-tight">
          About PDF Chat Bot
        </h1>

        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          PDF Chat Bot helps you understand documents faster by turning static
          PDFs into interactive, searchable conversations.
        </p>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl px-6 py-16"
      >
        <h2 className="text-2xl font-medium">Our Mission</h2>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          Reading long documents should not slow you down. Our mission is to
          make information inside PDFs instantly accessible, accurate, and
          trustworthy — without forcing you to search page by page.
        </p>
      </motion.section>

      {/* What We Do */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl px-6 py-16"
      >
        <h2 className="text-2xl font-medium">What PDF Chat Bot Does</h2>

        <ul className="mt-6 space-y-4 text-muted-foreground">
          <li>
            • Lets you ask natural language questions about your PDF documents
          </li>
          <li>
            • Retrieves answers directly from relevant sections of the file
          </li>
          <li>
            • Shows clear source references so you can verify every response
          </li>
          <li>
            • Supports large, complex documents without performance issues
          </li>
        </ul>
      </motion.section>

      {/* Why We Built It */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl px-6 py-16"
      >
        <h2 className="text-2xl font-medium">Why We Built It</h2>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          We built PDF Chat Bot after experiencing how inefficient it is to
          extract answers from technical documents, reports, manuals, and
          research papers. Search tools return keywords. PDF Chat Bot returns
          understanding.
        </p>
      </motion.section>

      {/* Closing Section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl px-6 py-24"
      >
        <h2 className="text-2xl font-medium">Built for Clarity</h2>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          PDF Chat Bot is designed with clarity, transparency, and reliability
          at its core. Every answer is grounded in your document, so you can
          trust what you read and move forward with confidence.
        </p>
      </motion.section>
    </div>
  );
}
