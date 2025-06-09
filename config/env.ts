import z from "zod";

const envSchema = z
  .object({
    authSecret: z.string(),
    authUrl: z.string(),
    dburl: z.string(),
    dbToken: z.string().optional(),
    gmailSecret: z.string().optional(),
    gmailClientId: z.string().optional(),
    gmailUser: z.string().optional(),
    gmailToken: z.string().optional(),
  })
  .readonly();

export const env = envSchema.parse({
  authSecret: process.env.BETTER_AUTH_SECRET!,
  authUrl: process.env.BETTER_AUTH_URL!,
  dburl: process.env.DB_URL!,
  dbToken: process.env.DB_TOKEN,
  gmailSecret: process.env.GMAIL_CLIENT_SECRET,
  gmailClientId: process.env.GMAIL_CLIENT_ID,
  gmailUser: process.env.GMAIL_USER,
  gmailToken: process.env.GMAIL_TOKEN,
});
