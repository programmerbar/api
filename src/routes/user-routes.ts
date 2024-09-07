import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { invitations, users } from "../db/schema";
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

  app.post("/invitations", auth, async (c) => {
    const { success, data } = await parseJson(c, z.object({ email: z.string() }));

    if (!success) {
      return c.json({ error: "Bad request" }, { status: 400 });
    }

    const invitationId = nanoid();

    await c.var.db
      .insert(invitations)
      .values({
        id: invitationId,
        email: data.email,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      })
      .onConflictDoUpdate({
        target: invitations.email,
        targetWhere: sql`email = ${data.email}`,
        set: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });

    await c.var.resend.emails.send({
      to: data.email,
      from: "ikkesvar@echo-webkom.no",
      subject: "Invitasjon til Programmerbar-portalen",
      text: "Du har blit invitert til å lage bruker på Programmerbar-portalen. Logg inn her: https://portal.programmer.bar",
    });

    return c.json({
      message: "Invitation created",
      data: {
        id: invitationId,
      },
    });
  });
};
