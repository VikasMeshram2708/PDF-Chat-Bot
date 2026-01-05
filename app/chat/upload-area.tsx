"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export function UploadArea() {
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
        const jobId = result?.jobId;
        console.log("jobId-cl", jobId);
        if (!jobId) {
          toast.error("Job ID missing from server");
          return;
        }

        // 🔥 OPEN SSE
        const es = new EventSource(`/api/file/events?jobId=${result.jobId}`);

        es.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.status === "ready") {
            toast.success("PDF ready for Q&A");
            es.close();
          }
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
