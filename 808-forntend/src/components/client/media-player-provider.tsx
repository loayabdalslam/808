"use client";

import { useMediaPlayer } from "~/hooks/use-media-player";
import StunningMediaPlayer from "./stunning-media-player";

export default function MediaPlayerProvider() {
  const { isOpen, audioUrl, title, voice, autoPlay, closePlayer } = useMediaPlayer();

  if (!isOpen || !audioUrl) {
    return null;
  }

  return (
    <StunningMediaPlayer
      audioUrl={audioUrl}
      title={title}
      voice={voice}
      autoPlay={autoPlay}
      onClose={closePlayer}
    />
  );
}
