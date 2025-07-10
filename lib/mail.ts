import { env } from "@/config/env";
import { createTransport } from "nodemailer";

export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: env.gmailUser,
    pass: env.gmailPass,
  },
});

console.log(env);
