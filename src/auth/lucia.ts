import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { Database } from "../db/drizzle";
import { User, sessions, users } from "../db/schema";

export type Auth = ReturnType<typeof createAuth>;

export const createAuth = (db: Database) => {
  const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (user) => user,
  });
};

declare module "lucia" {
  interface Register {
    Lucia: Auth;
    DatabaseUserAttributes: User;
  }
}
