import { Hono } from "hono";
import { getStatusMessage, STATUS, StatusService } from "./services/status";

type Command = (typeof COMMAND)[keyof typeof COMMAND];

const COMMAND = {
  OPEN: "/åpent",
  HAPPY: "/happy",
  CLOSED: "/stengt",
  PRIVATE: "/privat",
  STATUS: "/skjer",
} as const;

const getStatusNumber = (command: Command) => {
  switch (command) {
    case COMMAND.OPEN:
      return STATUS.OPEN;
    case COMMAND.CLOSED:
      return STATUS.CLOSED;
    case COMMAND.PRIVATE:
      return STATUS.PRIVATE;
    default:
      return STATUS.PRIVATE;
  }
};

const isCommand = (command: string | null): command is Command =>
  Object.values(COMMAND).includes(command as Command);

export type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const app = new Hono<{ Bindings: Bindings }>();

app.post("/slack-command", async (c) => {
  const formData = await c.req.formData();
  const statusKV = new StatusService(c.env.STATUS_KV);
  const command = formData.get("command");

  if (!isCommand(command)) {
    c.status(400);
    return c.text("Ukjent kommando.");
  }

  if (command === COMMAND.STATUS) {
    const status = await statusKV.getStatus();
    const text = getStatusMessage(status);

    return c.json({
      response_type: "in_channel",
      text,
    });
  }

  if (formData.get("token") !== c.env.SLACK_VERIFICATION_TOKEN) {
    c.status(401);
    return;
  }

  if (formData.get("channel_id") !== c.env.SLACK_CHANNEL_ID) {
    c.status(403);
    return;
  }

  const status = getStatusNumber(command);
  const text = getStatusMessage(status);
  await statusKV.setStatus(status);

  return c.json({
    response_type: "in_channel",
    text,
  });
});

export default app;
