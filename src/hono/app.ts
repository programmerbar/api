import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { StatusService, createStatusService } from "../services/status";
import { cors } from "./middleware";

export type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

export type Variables = {
  ip: string;
  services: {
    statusKV: StatusService;
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

  return app;
};
