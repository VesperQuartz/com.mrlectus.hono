import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { auth } from "@/lib/auth";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
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

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.get("/hello", (c) => {
  return c.text("Hello Hono!");
});

export default app;
