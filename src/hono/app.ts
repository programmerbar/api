import { Hono } from "hono";
import { StatusService, createStatusService } from "../services/status";

export type Env = {
  Bindings: {
    STATUS_KV: KVNamespace;
    SLACK_VERIFICATION_TOKEN: string;
    SLACK_CHANNEL_ID: string;
  };
  Variables: {
    ip: string;
    services: {
      statusKV: StatusService;
    };
  };
};

export type App = ReturnType<typeof createApp>;

export const createApp = () => {
  const app = new Hono<Env>();

  app.use("*", async (c, next) => {
    const ip = c.req.header("CF-Connecting-IP") || "127.0.0.1";
    const statusService = createStatusService(c.env.STATUS_KV);

    c.set("services", {
      statusKV: statusService,
    });

    c.set("ip", ip);

    await next();
  });

  return app;
};
