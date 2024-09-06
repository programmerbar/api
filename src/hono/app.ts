import { Hono } from "hono";
import { StatusService, createStatusService } from "../services/status";
import { cors } from "hono/cors";

export type AppEnv = {
  Bindings: {
    R2: R2Bucket;
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

  app.use(
    "*",
    cors({
      origin: [
        "https://portal.programmer.bar",
        "https://programmer.bar",
        "http://localhost:5173",
      ],
      allowMethods: ["GET", "POST", "OPTIONS"],
    })
  );

  return app;
};
