import z from "zod";

const envSchema = z
	.object({
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.string(),
		DB_URL: z.string(),
		DB_TOKEN: z.string(),
		GMAIL_USER: z.string(),
		GMAIL_PASS: z.string(),
	})
	.readonly();

export const env = envSchema.parse(process.env);
