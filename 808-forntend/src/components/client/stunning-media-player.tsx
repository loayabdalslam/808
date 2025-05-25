"use client";

import { useState, useEffect, useRef } from "react";
import {
  IoPlay,
  IoPause,
  IoVolumeHigh,
  IoVolumeMute,
  IoDownload,
  IoRepeat,
  IoShuffle,
  IoHeart,
  IoHeartOutline,
  IoExpand,
  IoContract,
  IoSkipForward,
  IoSkipBackward,
  IoClose,
} from "react-icons/io5";
import { RiForward10Fill, RiReplay10Fill } from "react-icons/ri";

interface StunningMediaPlayerProps {
  audioUrl: string;
  title: string;
  voice?: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

export default function StunningMediaPlayer({
  audioUrl,
  title,
  voice,
  onClose,
  autoPlay = false,
}: StunningMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(50).fill(0));

  // Audio context for visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (autoPlay) {
        audio.play();
        setIsPlaying(true);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Setup audio visualizer
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [autoPlay, isRepeat]);

  // Visualizer animation
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;

    const updateVisualizer = () => {
      const bufferLength = analyserRef.current!.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current!.getByteFrequencyData(dataArray);

      const normalizedData = Array.from(dataArray.slice(0, 50)).map(value => value / 255);
      setVisualizerData(normalizedData);
    };

    const interval = setInterval(updateVisualizer, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const downloadAudio = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${title}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${isExpanded ? 'p-4' : 'p-8'}`}>
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 ${isExpanded ? 'w-full h-full' : 'w-full max-w-md h-auto'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <IoClose className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Expand/Contract Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-4 right-16 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isExpanded ? (
            <IoContract className="w-5 h-5 text-white" />
          ) : (
            <IoExpand className="w-5 h-5 text-white" />
          )}
        </button>

        <div className={`relative z-10 p-8 ${isExpanded ? 'h-full flex flex-col' : ''}`}>
          {/* Visualizer */}
          <div className={`flex items-end justify-center space-x-1 mb-8 ${isExpanded ? 'h-32' : 'h-20'}`}>
            {visualizerData.map((height, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-full transition-all duration-75 ease-out"
                style={{
                  height: `${Math.max(4, height * (isExpanded ? 120 : 80))}px`,
                  width: isExpanded ? '6px' : '4px',
                  opacity: isPlaying ? 0.8 + height * 0.2 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Track Info */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2 truncate">{title}</h3>
            {voice && (
              <p className="text-purple-200 text-sm opacity-80">Voice: {voice}</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div
              className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="absolute h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-sm text-purple-200 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <button
              onClick={skipBackward}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RiReplay10Fill className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={skipBackward}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <IoSkipBackward className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <IoPause className="w-8 h-8 text-white" />
              ) : (
                <IoPlay className="w-8 h-8 text-white ml-1" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <IoSkipForward className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={skipForward}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RiForward10Fill className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isLiked ? (
                  <IoHeart className="w-5 h-5 text-red-400" />
                ) : (
                  <IoHeartOutline className="w-5 h-5 text-white/70" />
                )}
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isRepeat ? 'text-purple-400' : 'text-white/70'}`}
              >
                <IoRepeat className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isMuted ? (
                  <IoVolumeMute className="w-5 h-5 text-white/70" />
                ) : (
                  <IoVolumeHigh className="w-5 h-5 text-white/70" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'transparent',
                }}
              />

              <button
                onClick={downloadAudio}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <IoDownload className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
        }

        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
          border: none;
        }
      `}</style>
    </div>
  );
}
