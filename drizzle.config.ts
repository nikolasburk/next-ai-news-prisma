// set -x POSTGRES_URL postgresql://nikolasburk:nikolasburk@localhost:5432/next-ai-news

import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL is not defined. Make sure to `vc env pull` to get `.env.local`"
  );
}

console.log(`process.env.POSTGRES_URL: `, process.env.POSTGRES_URL)

export default {
  schema: "./app/db.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL,
  },
} satisfies Config;
