"use client";

import { create } from "zustand";

interface MediaPlayerState {
  isOpen: boolean;
  audioUrl: string | null;
  title: string;
  voice?: string;
  autoPlay: boolean;
}

interface MediaPlayerActions {
  openPlayer: (audioUrl: string, title: string, voice?: string, autoPlay?: boolean) => void;
  closePlayer: () => void;
  setAutoPlay: (autoPlay: boolean) => void;
}

type MediaPlayerStore = MediaPlayerState & MediaPlayerActions;

export const useMediaPlayer = create<MediaPlayerStore>((set) => ({
  // State
  isOpen: false,
  audioUrl: null,
  title: "",
  voice: undefined,
  autoPlay: false,

  // Actions
  openPlayer: (audioUrl, title, voice, autoPlay = true) =>
    set({
      isOpen: true,
      audioUrl,
      title,
      voice,
      autoPlay,
    }),

  closePlayer: () =>
    set({
      isOpen: false,
      audioUrl: null,
      title: "",
      voice: undefined,
      autoPlay: false,
    }),

  setAutoPlay: (autoPlay) => set({ autoPlay }),
}));

// Helper function to open the media player
export const openMediaPlayer = (
  audioUrl: string,
  title: string,
  voice?: string,
  autoPlay = true
) => {
  useMediaPlayer.getState().openPlayer(audioUrl, title, voice, autoPlay);
};

// Helper function to close the media player
export const closeMediaPlayer = () => {
  useMediaPlayer.getState().closePlayer();
};
