import { App } from "../hono/app";

export const registerImagesRoutes = (app: App) => {
  app.get("/image/:id", async (c) => {
    const { R2 } = c.env;
    const { id } = c.req.param();

    const image = await R2.get(`avatars/${id}`);

    if (!image) {
      return c.json({ error: "Image not found" }, 404);
    }

    const headers = new Headers(Object.entries(image.httpMetadata ?? {}));
    headers.set("etag", image.etag ?? "");

    return new Response(image.body, { headers });
  });
};
