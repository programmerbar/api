import { setCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";
import { AppContext } from "../hono/app";

export const setSessionCookie = (c: AppContext, sessionId: string, options?: CookieOptions) =>
  setCookie(c, c.var.auth.sessionCookieName, sessionId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    ...options,
  });
