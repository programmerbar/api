import { createApp } from "./hono/app";
import { registerSlackRoutes } from "./routes/slack-routes";
import { registerStatusRoutes } from "./routes/status-routes";

const app = createApp();

registerStatusRoutes(app);
registerSlackRoutes(app);

export default app;
