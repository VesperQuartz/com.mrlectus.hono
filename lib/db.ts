import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/src/repo/schema/schema";
import * as authschema from "@/src/repo/schema/auth.schema";

const sql = neon(process.env.DB_URL!);
export const db = drizzle({
  client: sql,
  schema: {
    ...schema,
    ...authschema,
  },
});
