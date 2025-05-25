import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteAuthToken } from "../../../../lib/db-service";

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = cookies().get("auth-token")?.value;

    if (token) {
      // Delete token from database
      deleteAuthToken(token);
    }

    // Clear the cookie
    const response = NextResponse.json({
      message: "Logged out successfully",
    });

    response.cookies.delete("auth-token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
