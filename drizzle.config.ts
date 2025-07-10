import { defineConfig } from "drizzle-kit";
import { env } from "./config/env";

export default defineConfig({
  schema: "./src/repo/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.dburl,
  },
});
