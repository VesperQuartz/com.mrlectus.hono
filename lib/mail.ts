import { createTransport } from "nodemailer";
import { env } from "@/config/env";

export const transporter = createTransport({
	service: "gmail",
	auth: {
		user: env.GMAIL_USER,
		pass: env.GMAIL_PASS,
	},
});
