import { createApp } from "./hono/app";
import { registerAuthRoutes } from "./routes/auth-routes";
import { registerImagesRoutes } from "./routes/images-routes";
import { registerSlackRoutes } from "./routes/slack-routes";
import { registerStatusRoutes } from "./routes/status-routes";

const app = createApp();

registerAuthRoutes(app);
registerStatusRoutes(app);
registerSlackRoutes(app);
registerImagesRoutes(app);

export default app;
