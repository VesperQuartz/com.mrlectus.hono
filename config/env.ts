import z from "zod";

const envSchema = z
  .object({
    authSecret: z.string(),
    authUrl: z.string(),
    dburl: z.string(),
    dbToken: z.string().optional(),
    gmailUser: z.string().optional(),
    gmailPass: z.string().optional(),
  })
  .readonly();

export const env = envSchema.parse({
  authSecret: process.env.BETTER_AUTH_SECRET!,
  authUrl: process.env.BETTER_AUTH_URL!,
  dburl: process.env.DB_URL!,
  dbToken: process.env.DB_TOKEN,
  gmailUser: process.env.GMAIL_USER,
  gmailPass: process.env.GMAIL_PASS,
});
