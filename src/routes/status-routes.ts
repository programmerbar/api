import { App } from "../hono/app";
import { getStatusMessage } from "../services/status";

export const registerStatusRoutes = (app: App) => {
  app.get("/", async (c) => {
    const { statusKV } = c.get("services");

    const status = await statusKV.getStatus();
    const message = getStatusMessage(status);

    return c.json(
      {
        status,
        message,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      },
    );
  });

  app.post("/", async (c) => {
    const json = await c.req.json<{ status: number }>();

    if (!("status" in json) || typeof json.status !== "number") {
      return c.json({ error: "Invalid request." }, { status: 400 });
    }

    const { statusKV } = c.get("services");

    await statusKV.setStatus(json.status);

    return c.json({ success: true });
  });
};
