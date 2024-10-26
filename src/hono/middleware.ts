import { cors as honoCors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { AppEnv } from "./app";

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
