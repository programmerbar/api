import { App } from "../hono/app";
import { STATUS, getStatusMessage } from "../services/status";

const CHANNEL_ID = "some-slack-channel-id";
const SLACK_VERIFICATION_TOKEN = "some-slack-verification-token";

export const registerSlackRoutes = (app: App) => {
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

    const { statusKV } = c.get("services");

    const command = formData.get("command");

    if (command && ["/åpen", "/steng"].includes(command)) {
      const newStatus = command === "/åpen" ? STATUS.OPEN : STATUS.CLOSED;
      const text = getStatusMessage(newStatus);
      await statusKV.setStatus(newStatus);

      return c.json({
        response_type: "in_channel",
        text,
      });
    }

    if (command === "/skjer") {
      const status = await statusKV.getStatus();
      const text = getStatusMessage(status);

      return c.json({
        response_type: "in_channel",
        text,
      });
    }

    c.status(400);
    return c.text("Ukjent kommando.");
  });
};
