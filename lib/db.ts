import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/config/env";
import * as authschema from "@/src/repo/schema/auth.schema";
import * as schema from "@/src/repo/schema/schema";

const sql = neon(env.DB_URL);
export const db = drizzle({
	client: sql,
	schema: {
		...schema,
		...authschema,
	},
});
