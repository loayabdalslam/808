import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getUserByToken, 
  getVoiceGenerationsByUser,
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // 'tts' or 'multi-speaker'

    // Get voice generations for user
    let generations = getVoiceGenerationsByUser(user.id, limit, offset);

    // Filter by type if specified
    if (type && (type === 'tts' || type === 'multi-speaker')) {
      generations = generations.filter(gen => gen.type === type);
    }

    // Transform the data for frontend
    const transformedGenerations = generations.map(gen => {
      const voiceConfig = JSON.parse(gen.voice_config);
      
      return {
        id: gen.id,
        type: gen.type,
        text: gen.text,
        audioUrl: gen.audio_url,
        createdAt: gen.created_at,
        speakers: gen.type === 'multi-speaker' 
          ? Object.keys(voiceConfig.speakers || {})
          : undefined,
        voice: gen.type === 'tts' ? voiceConfig.voice : undefined,
        duration: gen.duration,
        characters: gen.characters,
        status: gen.status
      };
    });

    // Get user stats
    const stats = getUserStats(user.id);

    return NextResponse.json({
      generations: transformedGenerations,
      stats: {
        totalGenerations: stats.totalGenerations,
        totalCharacters: stats.totalCharacters,
        totalDuration: stats.totalDuration,
        thisMonthUsage: stats.thisMonthUsage
      },
      pagination: {
        limit,
        offset,
        hasMore: generations.length === limit
      }
    });

  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching history" },
      { status: 500 }
    );
  }
}
