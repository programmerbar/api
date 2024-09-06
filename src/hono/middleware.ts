import { getCookie } from "hono/cookie";
import { cors as honoCors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { Session, User } from "lucia";
import { AppEnv } from "./app";

export const auth = createMiddleware<{
  Bindings: AppEnv["Bindings"];
  Variables: AppEnv["Variables"] & {
    user: User;
    session: Session;
  };
}>(async (c, next) => {
  const sessionId = getCookie(c, c.var.auth.sessionCookieName);

  if (!sessionId) {
    return c.json({ error: "Not logged in" }, 401);
  }

  const { session, user } = await c.var.auth.validateSession(sessionId);

  if (!user) {
    return c.json({ error: "Not logged in" }, 401);
  }

  c.set("user", user);
  c.set("session", session);

  return await next();
});

export const cors = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const origins = ["https://portal.programmer.bar", "https://programmer.bar"];

    if (c.env.ENV === "development") {
      origins.push("http://localhost:5173");
    }

    const middleware = honoCors({
      origin: origins,
      allowMethods: ["GET", "POST", "PUT", "DELTE", "OPTIONS"],
      credentials: true,
    });

    return await middleware(c, next);
  });
