"use client";

import { useState, useRef, useEffect } from "react";
import { IoPlay, IoPause, IoVolumeHigh, IoExpand } from "react-icons/io5";
import { openMediaPlayer } from "~/hooks/use-media-player";

interface MiniMediaPlayerProps {
  audioUrl: string;
  title: string;
  voice?: string;
  className?: string;
}

export default function MiniMediaPlayer({
  audioUrl,
  title,
  voice,
  className = "",
}: MiniMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const openFullPlayer = () => {
    // Pause the mini player
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
    
    // Open the full stunning media player
    openMediaPlayer(audioUrl, title, voice, isPlaying);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-200/50 shadow-lg backdrop-blur-sm ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {title}
            </h3>
          </div>
          <button
            onClick={openFullPlayer}
            className="p-2 rounded-full bg-white/50 hover:bg-white/70 transition-colors group"
            title="Open full player"
          >
            <IoExpand className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
          </button>
        </div>

        {voice && (
          <p className="text-sm text-purple-600 mb-4 opacity-80">
            Voice: {voice}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-purple-600 mt-2 opacity-70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <IoPause className="w-6 h-6 text-white" />
            ) : (
              <IoPlay className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          <div className="flex items-center space-x-2 text-purple-600">
            <IoVolumeHigh className="w-5 h-5" />
            <span className="text-sm font-medium">Ready to play</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium">
              {isLoading ? "Loading..." : isPlaying ? "Playing" : "Ready"}
            </span>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
