import { Hono } from "hono";
import { getStatusMessage } from "./lib/status-message";
import { intOrZero } from "./lib/int";

const STATUS_KEY = "status";
const CLOSED_STATUS = 0;
const OPEN_STATUS = 1;

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

const CHANNEL_ID = "some-slack-channel-id";
const SLACK_VERIFICATION_TOKEN = "some-slack-verification-token";

app.post("/slack-command", async (c) => {
  const formData = await c.req.formData();

  if (formData.get("token") !== SLACK_VERIFICATION_TOKEN) {
    c.status(401);
    return;
  }

  if (formData.get("channel_id") !== CHANNEL_ID) {
    c.status(403);
    return;
  }

  const command = formData.get("command");

  if (command && ["/åpen", "/steng"].includes(command)) {
    const newStatus = command === "/åpen" ? OPEN_STATUS : CLOSED_STATUS;
    await c.env.STATUS_KV.put(STATUS_KEY, String(newStatus));
    c.status(200);
    return c.json({
      response_type: "in_channel",
      text: getStatusMessage(newStatus),
    });
  }

  if (command === "/skjer") {
    const status = intOrZero(await c.env.STATUS_KV.get(STATUS_KEY));
    const message = getStatusMessage(status);

    c.status(200);
    return c.json({
      response_type: "in_channel",
      text: message,
    });
  }

  c.status(400);
  return c.text("Ukjent kommando.");
});

export default app;
