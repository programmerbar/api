import { App } from "../hono/app";
import { STATUS, getStatusMessage } from "../services/status";

type Command = (typeof COMMAND)[keyof typeof COMMAND];

const COMMAND = {
  OPEN: "/åpent",
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

export const registerSlackRoutes = (app: App) => {
  app.post("/slack-command", async (c) => {
    const formData = await c.req.formData();
    const { statusKV } = c.get("services");
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

    if ([COMMAND.OPEN, COMMAND.CLOSED, COMMAND.PRIVATE].includes(command)) {
      const status = getStatusNumber(command);
      const text = getStatusMessage(status);
      await statusKV.setStatus(status);

      return c.json({
        response_type: "in_channel",
        text,
      });
    }

    c.status(400);
    return c.text("Ukjent kommando.");
  });
};
