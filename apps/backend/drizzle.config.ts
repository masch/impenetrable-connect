import { defineConfig } from "drizzle-kit";
import { getCLIConfig } from "./src/config/env";

const config = getCLIConfig();

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.directUrl,
  },
});
