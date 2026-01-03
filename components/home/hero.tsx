"use client";

import { motion } from "motion/react";
import {
  CircleIcon,
  FilesIcon,
  LayersIcon,
  MessageSquareIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <motion.section
      initial={{ filter: "blur(10px)", y: 8 }}
      animate={{ filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="
        relative
        mx-auto max-w-7xl
        px-4 py-14 
      "
    >
      {/* Badge (floats slightly away from main flow) */}
      <div className="mb-10 sm:mb-14">
        <Badge className="inline-flex items-center gap-2 text-sm sm:text-base font-medium">
          Introducing our most advanced AI-powered PDF engine
        </Badge>
      </div>

      {/* Main content block (narrower for hierarchy) */}
      <div className="space-y-6 sm:space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-medium tracking-tight text-balance">
          Turn PDFs into intelligent conversations
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
          Upload documents, ask questions, and get accurate, context-aware
          answers instantly — powered by a scalable AI RAG system.
        </p>
      </div>

      {/* CTA row (slightly detached vertically) */}
      <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row tems-center gap-3 max-w-xl">
        <Button
          size="lg"
          className="rounded-full px-8 py-6 text-base sm:text-lg"
        >
          Get Started
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="sm:sm:sm:sm:sm:sm:sm:sm:sm:flex-1 rounded-full px-8 py-6 text-base sm:text-lg"
        >
          View Demo
        </Button>
      </div>

      {/* Marquee strip (dense + offset like Tailwind site) */}
      <div className="relative mt-16 sm:mt-20 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden border-t border-border/50">
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            duration: 28,
            ease: "linear",
          }}
          className="
            flex w-max items-center
            gap-10
            py-4
            whitespace-nowrap
            text-sm
            text-muted-foreground
          "
        >
          {[
            { icon: CircleIcon, text: "Upload PDFs" },
            { icon: SparklesIcon, text: "Chat with documents" },
            { icon: MessageSquareIcon, text: "Instant answers" },
            { icon: SearchIcon, text: "AI-powered search" },
            { icon: ShieldCheckIcon, text: "Secure & private" },
            { icon: LayersIcon, text: "RAG-based intelligence" },
            { icon: FilesIcon, text: "Multi-file support" },
            { icon: ZapIcon, text: "Lightning-fast responses" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4">
              <item.icon className="size-4 text-cyan-500" />
              <span>{item.text}</span>
            </div>
          ))}

          {/* duplicate for seamless loop */}
          {[
            { icon: CircleIcon, text: "Upload PDFs" },
            { icon: SparklesIcon, text: "Chat with documents" },
            { icon: MessageSquareIcon, text: "Instant answers" },
            { icon: SearchIcon, text: "AI-powered search" },
            { icon: ShieldCheckIcon, text: "Secure & private" },
            { icon: LayersIcon, text: "RAG-based intelligence" },
            { icon: FilesIcon, text: "Multi-file support" },
            { icon: ZapIcon, text: "Lightning-fast responses" },
          ].map((item, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-2 px-4">
              <item.icon className="size-4 text-cyan-500" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
