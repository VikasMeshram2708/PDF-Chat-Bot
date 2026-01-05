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

      console.log("Selected file:", file);

      // TODO: enqueue upload / call API here
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post("/api/file/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const result = await res.data;
        console.log("res", result);
        if (!result.success) {
          toast.error(result.message ?? "Failed");
          return;
        }
        toast.success(result?.message ?? "Uploaded");
      } catch (error) {
        console.error("error ", error);
        toast.error("Upload failed.");
      }
    };

    // Required for Safari + Firefox
    document.body.appendChild(input);

    input.click();

    // Cleanup AFTER selection cycle
    setTimeout(() => {
      document.body.removeChild(input);
    }, 0);
  };

  return (
    <section className="w-sm">
      <Card
        className="border max-w-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleFileSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleFileSelect();
          }
        }}
      >
        <CardHeader className="flex items-center justify-center">
          <CardTitle className="bg-secondary/60 hover:bg-secondary transition-colors duration-300 ease-in-out p-5 rounded-full">
            <UploadIcon
              className="hover:text-primary transition-colors duration-300 ease-in-out"
              size={44}
            />
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
