import { defineConfig } from "drizzle-kit";
import { getCLIConfig } from "./src/config/env";
import { SCHEMA_NAME } from "./src/db/schema/base";

const config = getCLIConfig();

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.directUrl,
  },
  schemaFilter: [SCHEMA_NAME],
});
