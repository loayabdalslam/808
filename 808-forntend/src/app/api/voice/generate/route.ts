import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserByToken,
  createVoiceGeneration,
  updateVoiceGeneration,
  updateUserUsage
} from "../../../../lib/db-service";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { text, voice, type = 'tts', speakers } = body;

    // Validate input based on type
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (type === 'multi-speaker') {
      if (!speakers || Object.keys(speakers).length === 0) {
        return NextResponse.json(
          { error: "Speakers configuration is required for multi-speaker TTS" },
          { status: 400 }
        );
      }
    } else {
      if (!voice) {
        return NextResponse.json(
          { error: "Voice is required for single-speaker TTS" },
          { status: 400 }
        );
      }
    }

    // Create voice configuration based on type
    const voiceConfig = type === 'multi-speaker'
      ? { speakers: speakers || {} }
      : { voice };

    // Create voice generation record
    const generationId = createVoiceGeneration(
      user.id,
      type,
      text,
      voiceConfig
    );

    // Update generation status to processing
    updateVoiceGeneration(generationId, {
      status: 'processing'
    });

    try {
      // Determine the correct endpoint and payload based on type
      const endpoint = type === 'multi-speaker' ? '/multi-speaker' : '/tts';
      const payload = type === 'multi-speaker'
        ? { text, speakers }
        : { text, voice };

      // Call the actual TTS API (your existing backend)
      const ttsResponse = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer default-api-key-for-development',
        },
        body: JSON.stringify(payload),
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS API error: ${ttsResponse.statusText}`);
      }

      const ttsResult = await ttsResponse.json();

      // Calculate duration (mock for now - you can get this from audio file)
      const estimatedDuration = text.length * 0.05; // ~50ms per character

      // Update generation record with success
      updateVoiceGeneration(generationId, {
        audio_url: ttsResult.audio_url,
        audio_filename: ttsResult.audio_url?.split('/').pop(),
        duration: estimatedDuration,
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      // Update user usage
      updateUserUsage(user.id, text.length, 1, estimatedDuration);

      return NextResponse.json({
        id: generationId,
        audio_url: ttsResult.audio_url,
        duration: estimatedDuration,
        characters_used: text.length,
        status: 'completed'
      });

    } catch (error) {
      console.error('TTS generation error:', error);

      // Update generation record with error
      updateVoiceGeneration(generationId, {
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      });

      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Voice generation error:", error);
    return NextResponse.json(
      { error: "An error occurred during voice generation" },
      { status: 500 }
    );
  }
}
