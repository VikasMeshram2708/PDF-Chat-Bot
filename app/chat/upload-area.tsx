"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useRef } from "react";

export function UploadArea() {
  const eventRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // const eventSource = new EventSource("/api/file/events");
    // eventSource.onopen = () => {
    //   console.log("SSE-established!!!");
    // };
    // eventSource.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   console.log("SSE-Data", data);
    // };

    // eventSource.onerror = (error) => {
    //   console.log("SSE-error", error);
    //   eventSource.close();
    // };

    return () => {
      eventRef.current?.close();
      eventRef.current = null;
    };
  }, []);

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post("/api/file/upload", formData);
        const result = await res.data;
        console.log("result", result);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Processing your file…");
        // close existing sse connections
        if (eventRef.current) {
          eventRef.current.close();
          eventRef.current = null;
        }

        // connect to sse
        const documentId = result?.documentId;

        if (!documentId) {
          toast.error("Missing document id");
          return;
        }
        const eventSource = new EventSource(`/api/file/events/${documentId}`);
        eventRef.current = eventSource;
        eventSource.onopen = () => {
          console.log("sse-established");
        };
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("SSE_data", data);
          toast.success("File ready of Q&A!");
          eventSource.close();
        };

        eventSource.onerror = (error) => {
          console.log("sse-error", error);
          toast.error("Error processing file");
          eventSource.close();
        };
      } catch (error) {
        toast.error("Upload failed");
      }
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 0);
  };

  return (
    <section className="w-sm">
      <Card
        className="border max-w-sm cursor-pointer hover:shadow-md"
        onClick={handleFileSelect}
      >
        <CardHeader className="flex items-center justify-center">
          <CardTitle className="p-5 rounded-full bg-secondary/60">
            <UploadIcon size={44} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-muted-foreground">
            Upload your PDF file
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
