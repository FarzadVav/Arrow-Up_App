import { getCurrentUserQuery } from "@/features/auth/api/queries";
import { jsonNoStore, handleApiError } from "@/features/general/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUserQuery();

    if (!user) {
      return jsonNoStore({ user: null, message: "Unauthenticated" }, 401);
    }

    return jsonNoStore({ user });
  } catch (error) {
    return handleApiError(error, "Failed to get current user in /api/auth/me:");
  }
}
