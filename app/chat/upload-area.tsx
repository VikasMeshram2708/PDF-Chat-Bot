"use client";

import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function UploadArea() {
  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const res = await axios.post("/api/file/upload", formData);
        const data = res.data;

        if (!data?.success) {
          toast.error(data?.message ?? "Upload failed");
          return;
        }

        toast.success(data.message ?? "Uploaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Internal server error.");
      }
    };

    input.click();
  };

  return (
    <aside className="lg:w-[320px] shrink-0">
      <section className="relative rounded-2xl border border-gray-400 bg-secondary/40 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-6">
          <button
            type="button"
            onClick={handleFileUpload}
            className="rounded-full border border-primary bg-background p-4 hover:scale-105 transition"
          >
            <UploadIcon className="size-8 sm:size-9" />
          </button>

          <div className="space-y-1">
            <p className="text-sm font-medium">Upload your PDF</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Drag & drop or click to select a file
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
