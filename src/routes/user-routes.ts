import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../db/schema";
import { App } from "../hono/app";
import { auth } from "../hono/middleware";
import { parseJson } from "../utils/parse-json";

export const registerUserRoutes = (app: App) => {
  app.post("/user", auth, async (c) => {
    const userId = c.var.user.id;

    const { success, data } = await parseJson(c, z.object({ name: z.string(), email: z.string() }));

    if (!success) {
      return c.json({ error: "Bad request" }, { status: 400 });
    }

    await c.var.db
      .update(users)
      .set({
        name: data.name,
        email: data.email,
      })
      .where(eq(users.id, userId));

    return c.json({
      message: "User updated",
    });
  });

  app.get("/users", auth, async (c) => {
    const users = await c.var.db.query.users.findMany();

    return c.json(users);
  });
};
