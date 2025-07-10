import to from "await-to-ts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, bearer, haveIBeenPwned, openAPI } from "better-auth/plugins";
import { MailServer } from "@/services/mail";
import { db } from "./db";
import { transporter } from "./mail";
import { ac, adminRole, customRole, userRole } from "./permission";

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
		admin({
			ac,
			roles: {
				admin: adminRole,
				user: userRole,
				custom: customRole,
				superadmin: adminRole,
			},
			defaultRole: "user",
			adminRoles: ["admin", "superadmin"],
		}),
		haveIBeenPwned({
			customPasswordCompromisedMessage: "Please choose a more secure password.",
		}),
	],
	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					if (!ctx?.body?.role) {
						return {
							data: { ...user },
						};
					}
					return { data: { ...user, role: ctx?.body?.role } };
				},
			},
		},
	},
});

export type AuthEnv = {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
};
