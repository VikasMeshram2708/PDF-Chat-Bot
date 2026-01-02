import { inngest } from "@/app/inngest/client";
import { processPDF } from "@/app/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    processPDF,
  ],
});
