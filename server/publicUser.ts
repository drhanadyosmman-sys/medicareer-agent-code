import type { User } from "../drizzle/schema";

/**
 * The only shape of a user that may cross the wire.
 *
 * Built by naming fields explicitly rather than deleting from a spread, so a
 * column added to the users table later (another secret, a reset token) is not
 * published to every client by default.
 */
export type PublicUser = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date;
};

export function toPublicUser(user: User | null | undefined): PublicUser | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
