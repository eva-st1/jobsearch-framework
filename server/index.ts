import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT || 8787);

serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, (info) => {
  console.log(`Jobsearch API listening on http://localhost:${info.port}`);
});
