import { env } from "@/config/env";
import { createTransport } from "nodemailer";

export const transporter = createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: env.gmailUser,
    clientId: env.gmailClientId,
    clientSecret: env.gmailSecret,
    refreshToken: env.gmailToken,
  },
});

console.log(env);
