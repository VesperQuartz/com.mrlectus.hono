import { betterAuth } from "better-auth";
import { bearer, haveIBeenPwned, openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { transporter } from "./mail";
import to from "await-to-ts";
import { MailServer } from "@/services/mail";

export const auth = betterAuth({
  rateLimit: {
    window: 10,
    max: 100,
    enabled: true,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: true,
    password: {
      hash: async (password: string) => {
        const [hashError, hashedPassword] = await to(
          Bun.password.hash(password),
        );
        if (hashError) {
          throw new Error(`Failed to hash password ${hashError.message}`);
        }
        return hashedPassword;
      },
      verify: async (data: { hash: string; password: string }) => {
        const [verifyError, verified] = await to(
          Bun.password.verify(data.password, data.hash),
        );
        if (verifyError) {
          throw new Error(`Failed to verify password ${verifyError.message}`);
        }
        return verified;
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const mailer = new MailServer(transporter);
      const [error] = await to(
        mailer.sendVerificationEmail({
          recipient: user.email,
          tokenUrl: url,
        }),
      );
      if (error) {
        throw new Error(error.message);
      }
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    bearer(),
    openAPI(),
    haveIBeenPwned({
      customPasswordCompromisedMessage: "Please choose a more secure password.",
    }),
  ],
});
