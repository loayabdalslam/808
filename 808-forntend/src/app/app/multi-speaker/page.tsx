"use client";

import { useState, useEffect, useRef } from "react";
import { openMediaPlayer } from "~/hooks/use-media-player";
import MiniMediaPlayer from "~/components/client/mini-media-player";

// Speaker component with stunning design
const Speaker = ({
  name,
  voice,
  voices,
  onNameChange,
  onVoiceChange,
  onRemove,
  canRemove,
  index
}: {
  name: string;
  voice: string;
  voices: Record<string, string>;
  onNameChange: (name: string) => void;
  onVoiceChange: (voice: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
}) => {
  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-blue-500"
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <div className="mb-6 group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg`}>
              {index + 1}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Speaker {index + 1}</h3>
          </div>
          {canRemove && (
            <button
              onClick={onRemove}
              className="group/btn p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:scale-110">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              👤 Speaker Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Alice, Bob, Narrator"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              🎤 Voice Selection
            </label>
            <select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50 backdrop-blur-sm"
            >
              <option value="">Choose a voice...</option>
              {Object.entries(voices).map(([voiceName, description]) => (
                <option key={voiceName} value={voiceName}>
                  {voiceName} - {description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MultiSpeakerPage() {
  const [voices, setVoices] = useState<Record<string, string>>({});
  const [speakers, setSpeakers] = useState([
    { name: "Alice", voice: "" },
    { name: "Bob", voice: "" }
  ]);
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

      // Set default voices if available
      if (Object.keys(data.voices).length > 0) {
        const voiceNames = Object.keys(data.voices);
        setSpeakers(prev =>
          prev.map((speaker, index) => ({
            ...speaker,
            voice: voiceNames[index % voiceNames.length] || ""
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
      setError("Failed to fetch voices. Please check your API key and connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakerNameChange = (index: number, name: string) => {
    const newSpeakers = [...speakers];
    newSpeakers[index].name = name;
    setSpeakers(newSpeakers);
  };

  const handleSpeakerVoiceChange = (index: number, voice: string) => {
    const newSpeakers = [...speakers];
    newSpeakers[index].voice = voice;
    setSpeakers(newSpeakers);
  };

  const handleRemoveSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const handleAddSpeaker = () => {
    setSpeakers([...speakers, { name: `Speaker ${speakers.length + 1}`, voice: "" }]);
  };

  const generateSpeech = async () => {
    if (!text) {
      setError("Please enter some text");
      return;
    }

    // Check if all speakers have names and voices
    const invalidSpeaker = speakers.find(s => !s.name || !s.voice);
    if (invalidSpeaker) {
      setError("All speakers must have a name and voice selected");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      // Convert speakers array to the format expected by the API
      const speakersMap: Record<string, string> = {};
      speakers.forEach(s => {
        speakersMap[s.name] = s.voice;
      });

      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          speakers: speakersMap,
          type: 'multi-speaker'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate speech");
      }

      const data = await response.json();
      setAudioUrl(data.audio_url);

      // Open the stunning media player
      const speakerNames = speakers.map(s => s.name).join(", ");
      openMediaPlayer(
        data.audio_url,
        `Multi-Speaker: ${text.substring(0, 40)}${text.length > 40 ? '...' : ''}`,
        `Speakers: ${speakerNames}`,
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
              <h1 className="text-3xl font-bold mb-2">Multi-Speaker Conversation 👥</h1>
              <p className="text-white/80 text-lg">
                Create dynamic conversations with multiple AI voices
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl">
                🎭
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            👥 Configure Speakers
          </h2>
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <span className="text-sm font-medium">{speakers.length} speakers</span>
          </div>
        </div>

        {speakers.map((speaker, index) => (
          <Speaker
            key={index}
            index={index}
            name={speaker.name}
            voice={speaker.voice}
            voices={voices}
            onNameChange={(name) => handleSpeakerNameChange(index, name)}
            onVoiceChange={(voice) => handleSpeakerVoiceChange(index, voice)}
            onRemove={() => handleRemoveSpeaker(index)}
            canRemove={speakers.length > 2}
          />
        ))}

        <div className="flex justify-center mb-8">
          <button
            onClick={handleAddSpeaker}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform group-hover:scale-110">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Add Another Speaker
          </button>
        </div>

        <div className="mb-8">
          <label className="mb-4 block text-lg font-semibold text-gray-900">
            💬 Conversation Script
          </label>
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Format:</strong> <code className="bg-white px-2 py-1 rounded text-purple-600">Speaker Name: Their dialogue</code>
            </p>
            <p className="text-xs text-gray-600">
              Each line should start with the speaker's name followed by a colon and their dialogue.
            </p>
          </div>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Alice: Hello! How are you doing today?&#10;Bob: I'm doing fantastic, thank you for asking! How about you?&#10;Alice: I'm great too! I've been working on some exciting AI projects.&#10;Bob: That sounds amazing! I'd love to hear more about it."
              className="w-full rounded-2xl border-2 border-gray-200 p-6 focus:border-purple-500 focus:outline-none transition-colors duration-200 resize-none bg-white/50 backdrop-blur-sm font-mono text-sm"
              rows={10}
            />
            <div className="absolute bottom-4 right-4 flex items-center space-x-4">
              <span className="text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                {text.split('\n').filter(line => line.trim()).length} lines
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
            disabled={isGenerating || !text || speakers.some(s => !s.name || !s.voice)}
            className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
              isGenerating || !text || speakers.some(s => !s.name || !s.voice)
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
                Creating Conversation...
              </span>
            ) : (
              <span className="flex items-center">
                🎭 Generate Conversation
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
            title={`Multi-Speaker: ${text.substring(0, 40)}${text.length > 40 ? '...' : ''}`}
            voice={`Speakers: ${speakers.map(s => s.name).join(", ")}`}
          />
        </div>
      )}
    </div>
  );
}
