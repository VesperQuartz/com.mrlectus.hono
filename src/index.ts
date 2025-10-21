import fs from "node:fs/promises";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { openAPIRouteHandler } from "hono-openapi";
import { type AuthEnv, auth } from "@/lib/auth";
import { todo } from "./routes/todo";

const app = new Hono<{
	Variables: AuthEnv;
}>().basePath("/api");

app.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

app.use(poweredBy());
app.use(logger());
app.use(secureHeaders());
app.use(requestId());
app.use(prettyJSON());
app.use(
	cors({
		origin: ["http://localhost:4000", "http://localhost:3002"],
		credentials: true,
	}),
);

app.use("*", async (ctx, next) => {
	const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

	if (!session) {
		ctx.set("user", null);
		ctx.set("session", null);
		return next();
	}

	ctx.set("user", session.user);
	ctx.set("session", session.session);
	return next();
});

app.get("/hello", (c) => {
	return c.text("Hello Hono!");
});

app.use("*", async (c, next) => {
	const session = c.get("session");
	const allowedPath = ["/api/docs", "/api/openapi", "/api/healthcheck"];
	if (!session) {
		const pathname = c.req.path;
		console.log(pathname, "Path");
		if (allowedPath.includes(pathname)) {
			return next();
		}
		return c.json({ message: "unauthorized" }, 401);
	}
	return next();
});

app.route("/", todo);

app.get("/healthcheck", (c) => {
	return c.json({
		context: c.get("requestId"),
		message: "Works fine",
	});
});

app.get(
	"/openapi",
	openAPIRouteHandler(app, {
		documentation: {
			info: {
				title: "Hono",
				version: "1.0.0",
				description: "API for greeting users",
			},
			servers: [
				{
					url: "http://localhost:3000",
					description: "Local server",
				},
			],
		},
	}),
);

app.get(
	"/docs",
	Scalar({
		theme: "fastify",
		url: "/api/openapi",
	}),
);

app.get(
	"/ws",
	upgradeWebSocket(async (c) => {
		const user = c.get("user");
		const groupId = c.req.header("X-group-id");
		return {
			onOpen: (evt, ws) => {
				ws.raw?.subscribe(groupId!);
				const msg = `user ${user.name} has entered group ${groupId}`;
				ws.raw?.publishText(groupId!, msg);
			},
			onMessage: async (evt, ws) => {
				ws.raw?.publishText(groupId!, evt.data.toString());
			},
			onClose: () => {
				console.log("connection closed");
			},
		};
	}),
);

export default {
	fetch: app.fetch,
	websocket,
};
