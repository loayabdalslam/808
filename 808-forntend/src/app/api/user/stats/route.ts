import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getUserByToken, 
  getUserStats 
} from "../../../../lib/db-service";

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

    // Get user by token
    const user = getUserByToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user stats
    const stats = getUserStats(user.id);

    // Calculate usage percentages (assuming limits)
    const monthlyCharacterLimit = 100000; // 100k characters per month
    const monthlyApiLimit = 2000; // 2k API calls per month

    const currentUsage = stats.thisMonthUsage || {
      characters_used: 0,
      api_calls: 0,
      audio_generated_seconds: 0
    };

    return NextResponse.json({
      totalStats: {
        totalGenerations: stats.totalGenerations,
        totalCharacters: stats.totalCharacters,
        totalDuration: stats.totalDuration
      },
      monthlyUsage: {
        charactersUsed: currentUsage.characters_used,
        charactersLimit: monthlyCharacterLimit,
        charactersPercentage: Math.round((currentUsage.characters_used / monthlyCharacterLimit) * 100),
        
        apiCalls: currentUsage.api_calls,
        apiCallsLimit: monthlyApiLimit,
        apiCallsPercentage: Math.round((currentUsage.api_calls / monthlyApiLimit) * 100),
        
        audioGenerated: currentUsage.audio_generated_seconds,
      },
      recentActivity: [
        { action: "Generated TTS", time: "2 minutes ago", status: "success" },
        { action: "Multi-speaker conversation", time: "1 hour ago", status: "success" },
        { action: "Voice synthesis", time: "3 hours ago", status: "success" },
      ]
    });

  } catch (error) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user stats" },
      { status: 500 }
    );
  }
}
