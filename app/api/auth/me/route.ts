import { NextResponse } from "next/server";
import { getCurrentUserQuery } from "@/features/auth/api/queries";

export async function GET() {
  try {
    const user = await getCurrentUserQuery();

    if (!user) {
      return NextResponse.json(
        { user: null, message: "Unauthenticated" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
    }

    return NextResponse.json(
      { user },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Failed to get current user in /api/auth/me:", error);
    return NextResponse.json(
      { user: null, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
