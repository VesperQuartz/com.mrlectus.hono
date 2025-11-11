import { createFactory } from "hono/factory";
import type { auth } from "@/lib/auth";

export const factory = createFactory<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}>();

export const authMiddleware = factory.createMiddleware(async (c, next) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ message: "Unauthorized" }, 401);
	}
	return next();
});
