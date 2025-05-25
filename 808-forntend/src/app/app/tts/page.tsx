"use client";

import { useState, useEffect, useRef } from "react";
import { openMediaPlayer } from "~/hooks/use-media-player";
import MiniMediaPlayer from "~/components/client/mini-media-player";

// Voice selector component with stunning design
const VoiceSelector = ({
  voices,
  selectedVoice,
  onVoiceChange
}: {
  voices: Record<string, string>;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}) => (
  <div className="mb-8">
    <label className="mb-4 block text-lg font-semibold text-gray-900">
      🎤 Select Voice
    </label>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(voices).map(([name, description]) => (
        <div
          key={name}
          className={`group cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            selectedVoice === name
              ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg shadow-purple-500/20"
              : "border-gray-200 bg-white hover:border-purple-300"
          }`}
          onClick={() => onVoiceChange(name)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`h-3 w-3 rounded-full ${
                  selectedVoice === name ? 'bg-purple-500' : 'bg-gray-300'
                }`}></div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
              </div>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            {selectedVoice === name && (
              <div className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-2 text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function TTSPage() {
  const [voices, setVoices] = useState<Record<string, string>>({});
  const [selectedVoice, setSelectedVoice] = useState("");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const apiKey = localStorage.getItem("apiKey");

      if (!apiKey) {
        setError("API key not found. Please set your API key in the dashboard.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/voices", {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch voices");
      }

      const data = await response.json();
      setVoices(data.voices);

      // Set default voice if available
      if (Object.keys(data.voices).length > 0) {
        const firstVoice = Object.keys(data.voices)[0];
        if (firstVoice) {
          setSelectedVoice(firstVoice);
        }
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
      setError("Failed to fetch voices. Please check your API key and connection.");
    } finally {
      setLoading(false);
    }
  };

  const generateSpeech = async () => {
    if (!text) {
      setError("Please enter some text");
      return;
    }

    if (!selectedVoice) {
      setError("Please select a voice");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          type: 'tts'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate speech");
      }

      const data = await response.json();
      setAudioUrl(data.audio_url);

      // Open the stunning media player
      openMediaPlayer(
        data.audio_url,
        `TTS: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
        selectedVoice,
        true
      );
    } catch (error) {
      console.error("Error generating speech:", error);
      setError(error instanceof Error ? error.message : "Failed to generate speech. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-600">Loading voices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5 blur-2xl"></div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Text to Speech 🎤</h1>
              <p className="text-white/80 text-lg">
                Transform your text into natural-sounding speech with AI
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl">
                🎵
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-800">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">!</div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
        <VoiceSelector
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
        />

        <div className="mb-8">
          <label className="mb-4 block text-lg font-semibold text-gray-900">
            📝 Your Text
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here... Try something like: 'Hello! Welcome to 808 Voice, the future of AI-powered speech synthesis.'"
              className="w-full rounded-2xl border-2 border-gray-200 p-6 focus:border-purple-500 focus:outline-none transition-colors duration-200 resize-none bg-white/50 backdrop-blur-sm"
              rows={8}
            />
            <div className="absolute bottom-4 right-4 flex items-center space-x-4">
              <span className="text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                {text.length} characters
              </span>
              {text && (
                <button
                  onClick={() => setText("")}
                  className="text-purple-600 hover:text-purple-800 bg-white/80 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={generateSpeech}
            disabled={isGenerating || !selectedVoice || !text}
            className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
              isGenerating || !selectedVoice || !text
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="mr-3 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Magic...
              </span>
            ) : (
              <span className="flex items-center">
                🎤 Generate Speech
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>

      {audioUrl && (
        <div className="mt-8">
          <MiniMediaPlayer
            audioUrl={audioUrl}
            title={`TTS: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`}
            voice={selectedVoice}
          />
        </div>
      )}
    </div>
  );
}
