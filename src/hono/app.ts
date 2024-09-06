import { GitHub } from "arctic";
import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { Auth, createAuth } from "../auth/lucia";
import { Feide, createFeideProvider } from "../auth/providers/feide";
import { createGitHubProvider } from "../auth/providers/github";
import { Database, createDatabase } from "../db/drizzle";
import { StatusService, createStatusService } from "../services/status";
import { cors } from "./middleware";

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

  app.use(cors());
  app.use(logger());

  app.use(async (c, next) => {
    const ip = c.req.header("CF-Connecting-IP") || "127.0.0.1";
    const statusKV = createStatusService(c.env.STATUS_KV);

    c.set("services", {
      statusKV,
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

  return app;
};
