import React, { useEffect, useRef } from "react";
import { JLF } from "../types/lyrics";
import getLyricStatus from "../helpers/lyricStatus";

export default function BasicLyrics({
  lyrics,
  currentTime,
}: {
  lyrics: JLF | null;
  currentTime: number;
}) {
  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeLyricRef.current) {
        activeLyricRef.current.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
      }
    }, 250); // Use timeout instead of interval
    return () => clearTimeout(timer);
  }, [activeLyricRef.current]);

  if (lyrics == null) {
    return null;
  }

  const lines = lyrics.lines;

  return (
    <div className="flex flex-col hide-scrollbar w-full max-w-max">
      {lyrics?.lines.lines.map((line, i) => {
        const segStatus = getLyricStatus(
          currentTime * 1000,
          line.time,
          lines.lines[i + 1]?.time ?? lines.linesEnd,
          -2.5
        );
        return (
          <div
            key={String(i) + line.text}
            className={`w-max max-w-full text-wrap transition-transform bg-transparent duration-0 mb-2 md:mb-4 lg:mb-8 py-2 text-left origin-left text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${
              segStatus.isActive ? "scale-100" : "scale-90"
            }`}
            // style={styles}
          >
            <div
              ref={
                segStatus.isActive && segStatus.percentage < 50
                  ? activeLyricRef
                  : null
              }
              className={`top-[15vh] h-4 w-4 absolute rounded-full`}
            />
            {line.text || "· · ·"}
          </div>
        );
      })}
    </div>
  );
}
