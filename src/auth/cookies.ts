import { CookieOptions, createCookie } from "@remix-run/node";
import { lucia } from "./lucia";

export const createStateCookie = (provider: string, options?: CookieOptions) =>
  createCookie(`${provider}_oauth_state`, {
    maxAge: 10 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    ...options,
  });

export const sessionCookie = createCookie(lucia.sessionCookieName);
