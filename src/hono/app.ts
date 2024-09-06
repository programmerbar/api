import { GitHub } from "arctic";
import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { Auth, createAuth } from "../auth/lucia";
import { Feide, createFeideProvider } from "../auth/providers/feide";
import { createGitHubProvider } from "../auth/providers/github";
import { Database, createDatabase } from "../db/drizzle";
import { StatusService, createStatusService } from "../services/status";

export type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

export type Variables = {
  ip: string;
  db: Database;
  auth: Auth;
  services: {
    statusKV: StatusService;
  };
  providers: {
    github: GitHub;
    feide: Feide;
  };
};

export type App = ReturnType<typeof createApp>;

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export type AppContext = Context<AppEnv>;

export const createApp = () => {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    const ip = c.req.header("CF-Connecting-IP") || "127.0.0.1";
    const statusService = createStatusService(c.env.STATUS_KV);

    c.set("services", {
      statusKV: statusService,
    });

    c.set("ip", ip);

    await next();
  });

  app.use(async (c, next) => {
    c.set("providers", {
      github: createGitHubProvider(c),
      feide: createFeideProvider(c),
    });

    await next();
  });

  app.use(async (c, next) => {
    const db = createDatabase(c.env.DB);

    c.set("db", db);

    c.set("auth", createAuth(db));

    await next();
  });

  app.use(
    "*",
    cors({
      origin: ["https://portal.programmer.bar", "https://programmer.bar", "http://localhost:5173"],
      allowMethods: ["GET", "POST", "PUT", "DELTE", "OPTIONS"],
      credentials: true,
    }),
  );

  return app;
};
