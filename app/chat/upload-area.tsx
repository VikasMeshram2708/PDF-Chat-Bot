"use client";

import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useRef } from "react";

export default function UploadArea() {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Cleanup function to close EventSource on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

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

        toast.success("File uploaded successfully!");

        // Close any existing EventSource connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // Connect to SSE endpoint to listen for status updates
        // Small delay to ensure DB transaction is committed
        const documentId = data.documentId;
        if (documentId) {
          // Wait a bit before connecting to avoid race condition
          setTimeout(() => {
            const eventSource = new EventSource(
              `/api/file/status/${documentId}`
            );
            eventSourceRef.current = eventSource;

            let previousStatus: string | null = null;
            let isClosed = false;

            const closeConnection = () => {
              if (!isClosed) {
                isClosed = true;
                eventSource.close();
                eventSourceRef.current = null;
              }
            };

            eventSource.onmessage = (event) => {
              try {
                const message = JSON.parse(event.data);

                // Only handle status messages, ignore other types
                if (message.type === "status") {
                  const currentStatus = message.status;

                  // Only show toast when status changes
                  if (currentStatus !== previousStatus) {
                    // Show toast for processing status
                    if (currentStatus === "processing") {
                      toast.info("Processing your document...");
                    } else if (currentStatus === "completed") {
                      toast.success(
                        "Processing finished! Your document is ready to use."
                      );
                      closeConnection();
                    } else if (currentStatus === "failed") {
                      toast.error(
                        `Processing failed for "${message.fileName}". Please try again.`
                      );
                      closeConnection();
                    }
                    // Note: We don't show toast for "queued" status as it happens immediately after upload

                    previousStatus = currentStatus;
                  }
                }
              } catch (err) {
                console.error("Error parsing SSE message:", err);
              }
            };

            eventSource.onerror = (error) => {
              // Only log errors, don't show toasts for connection issues
              // EventSource will automatically reconnect for transient errors
              // If connection is closed by server (status: 0), it's normal
              if (eventSource.readyState === EventSource.CLOSED) {
                closeConnection();
              }
            };
          }, 300); // Small delay to ensure DB commit
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Internal server error.");
      }
    };

    input.click();
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">New Chat</h2>
        <p className="text-sm text-muted-foreground">
          Upload a PDF to start chatting
        </p>
      </div>

      <button
        type="button"
        onClick={handleFileUpload}
        className="w-full relative rounded-lg border-2 border-dashed border-border bg-card hover:bg-accent/50 transition-colors p-8 flex flex-col items-center justify-center gap-4 group"
      >
        <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
          <UploadIcon className="size-6 text-primary" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium">Upload PDF</p>
          <p className="text-xs text-muted-foreground">
            Click to select a file
          </p>
        </div>
      </button>
    </div>
  );
}
