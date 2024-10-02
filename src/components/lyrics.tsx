import React, { useEffect, useState, useRef } from "react";
import { SongData } from "deskthing-client/dist/types";
import { useSmoothTimer } from "../hooks/useSmoothTimer";
import { JLF } from "../types/lyrics";
import { LyricsStore } from "../stores/lyricsStore";
import BasicLyrics from "./basicLyrics";

interface SongInfo {
  duration: number;
  currentTime: number;
}

export default function Lyrics({ trackProgress }: { trackProgress: number }) {
  const lyricsStore = LyricsStore.getInstance();
  const [lyrics, setLyrics] = useState<JLF | null>(lyricsStore.getLyrics());

  // Hook to get lyrics as they come in
  useEffect(() => {
    const onMusicUpdates = async (data: JLF) => {
      setLyrics(data);
      console.log("got lyrics", data);
    };

    const off = lyricsStore.on(onMusicUpdates);

    return () => {
      off();
    };
  });

  if (lyrics == null || lyrics.lines == null) {
    return (
      <div className="hide-scrollbar w-max h-screen max-w-full overflow-y-auto flex justify-center items-center text-4xl">
        We couldn't find any <br /> lyrics for this track.
      </div>
    );
  }

  return (
    <div
      className="hide-scrollbar w-full h-screen max-w-[80vw] overflow-y-auto"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 30% , black 50%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 30% , black 50%, transparent 100%)", // For WebKit browsers
      }}
    >
      <div className="h-[50vh]" />
      <BasicLyrics lyrics={lyrics} currentTime={trackProgress} />
      <div className="h-screen" />
    </div>
  );
}
