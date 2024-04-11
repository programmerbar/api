import { Hono } from "hono";
import { getStatusMessage } from "./lib/status-message";
import { intOrZero } from "./lib/int";

const STATUS_KEY = "status";

type Bindings = {
  STATUS_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const status = intOrZero(await c.env.STATUS_KV.get(STATUS_KEY));
  const message = getStatusMessage(status);

  return c.json({
    status,
    message,
  });
});

app.post("/", async (c) => {
  const json = await c.req.json<{ status: number }>();

  if (!("status" in json) || typeof json.status !== "number") {
    return c.json({ error: "Invalid request." }, { status: 400 });
  }

  await c.env.STATUS_KV.put(STATUS_KEY, String(json.status));

  return c.json({ success: true });
});

export default app;
