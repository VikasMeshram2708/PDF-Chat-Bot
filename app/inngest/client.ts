import { Inngest } from "inngest";
import { env } from "../env";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "pdf-bot",
  INNGEST_SIGNING_KEY: env.INNGEST_SIGNING_KEY,
});
