import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/config/env";
import * as authschema from "@/src/repo/schema/auth.schema";
import * as schema from "@/src/repo/schema/schema";

const sql = new Pool({
	connectionString: env.DB_URL,
});

export const db = drizzle({
	client: sql,
	schema: {
		...schema,
		...authschema,
	},
});
