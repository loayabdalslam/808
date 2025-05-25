import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken } from "../../../../lib/db-service";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = cookies().get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user by token from database
    const user = getUserByToken(token);

    if (!user) {
      // Token is invalid or expired, clear the cookie
      const response = NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
      response.cookies.delete("auth-token");
      return response;
    }

    // Return user info
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "An error occurred while getting user info" },
      { status: 500 }
    );
  }
}
