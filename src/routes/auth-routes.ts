import { getCookie, setCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import { generateState } from "oslo/oauth2";
import { getFeideUser } from "../auth/providers/feide";
import { getGitHubUser } from "../auth/providers/github";
import { users } from "../db/schema";
import { App } from "../hono/app";
import { auth } from "../hono/middleware";

export const registerAuthRoutes = (app: App) => {
  app.get("/auth", auth, async (c) => {
    return c.json(c.var.user);
  });

  app.post("/auth/sign-out", auth, async (c) => {
    const sessionId = c.var.session.id;
    if (!sessionId) {
      return c.json({ error: "Not logged in" }, 401);
    }

    await c.var.auth.invalidateSession(sessionId);

    return c.json({ success: true });
  });

  app.get("/auth/github", async (c) => {
    const { github } = c.get("providers");
    const state = generateState();
    const url = await github.createAuthorizationURL(state, {
      scopes: ["user:email", "user"],
    });

    setCookie(c, "github_oauth_state", state, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: c.env.ENV === "production",
      maxAge: 60 * 10,
    });

    return c.redirect(url.toString());
  });

  app.get("/auth/github/callback", async (c) => {
    const { github } = c.get("providers");
    const state = c.req.query("state");
    const code = c.req.query("code");
    const storedState = getCookie(c, "github_oauth_state");

    if (!state || !code || !storedState || state !== storedState) {
      return c.text("Invalid state", 400);
    }

    const tokens = await github.validateAuthorizationCode(code);
    const githubUser = await getGitHubUser(tokens.accessToken);
    const existingUser = await c.var.db.query.users.findFirst({
      where: (row, { eq }) => eq(row.githubId, githubUser.id),
    });

    if (existingUser) {
      const session = await c.var.auth.createSession(existingUser.id, {});
      const sessionCookie = c.var.auth.createSessionCookie(session.id);

      setCookie(c, c.var.auth.sessionCookieName, sessionCookie.value, {
        path: "/",
        secure: c.env.ENV === "production",
        ...sessionCookie.attributes,
      });

      return c.redirect(`${c.env.APP_URL}/dashboard`);
    }

    const userId = nanoid();

    await c.var.db.insert(users).values({
      id: userId,
      name: githubUser.username,
      email: githubUser.email,
      githubId: githubUser.id,
    });

    const session = await c.var.auth.createSession(userId, {});
    const sessionCookie = c.var.auth.createSessionCookie(session.id);

    setCookie(c, c.var.auth.sessionCookieName, sessionCookie.value, {
      path: "/",
      secure: c.env.ENV === "production",
      ...sessionCookie.attributes,
    });

    return c.redirect(`${c.env.APP_URL}/dashboard`);
  });

  app.get("/auth/feide", async (c) => {
    const { feide } = c.get("providers");
    const state = generateState();
    const url = await feide.createAuthorizationURL(state);

    setCookie(c, "feide_oauth_state", state, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: c.env.ENV === "production",
      maxAge: 60 * 10,
    });

    return c.redirect(url.toString());
  });

  app.get("/auth/feide/callback", async (c) => {
    const { feide } = c.get("providers");
    const state = c.req.query("state");
    const code = c.req.query("code");
    const storedState = getCookie(c, "feide_oauth_state");

    if (!state || !code || !storedState || state !== storedState) {
      return c.text("Invalid state", 400);
    }

    const tokens = await feide.validateAuthorizationCode(code);
    const feideUser = await getFeideUser(tokens.accessToken);
    const existingUser = await c.var.db.query.users.findFirst({
      where: (row, { eq }) => eq(row.feideId, feideUser.id),
    });

    if (existingUser) {
      const session = await c.var.auth.createSession(existingUser.id, {});
      const sessionCookie = c.var.auth.createSessionCookie(session.id);

      setCookie(c, c.var.auth.sessionCookieName, sessionCookie.value, {
        path: "/",
        secure: c.env.ENV === "production",
        ...sessionCookie.attributes,
      });

      return c.redirect(`${c.env.APP_URL}/dashboard`);
    }

    const userId = nanoid();

    await c.var.db.insert(users).values({
      id: userId,
      name: feideUser.username,
      email: feideUser.email,
      feideId: feideUser.id,
    });

    const session = await c.var.auth.createSession(userId, {});
    const sessionCookie = c.var.auth.createSessionCookie(session.id);

    setCookie(c, c.var.auth.sessionCookieName, sessionCookie.value, {
      path: "/",
      secure: c.env.ENV === "production",
      ...sessionCookie.attributes,
    });

    return c.redirect(`${c.env.APP_URL}/dashboard`);
  });
};
