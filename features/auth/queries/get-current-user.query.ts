import "server-only";
import { withRequestContext } from "@/db";

import type { AuthUser } from "../lib/definitions";
import { getUserId } from "../lib/actor";

export async function getCurrentUserQuery(): Promise<AuthUser | null> {
  const userId = await getUserId();
  if (userId === null) {
    return null;
  }

  return withRequestContext(async ({ user }) => {
    const record = await user.findSelf(userId);
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      username: record.username,
      email: record.email ?? null,
      locale: record.locale,
      colorScheme: record.colorScheme,
      createdAt: record.createdAt.toISOString(),
    };
  });
}
