import { useEffect, useMemo, useRef, useState } from "react";
import { JLF } from "../types/lyrics";
import getLyricStatus from "../helpers/lyricStatus";

export default function BasicLyrics({
  lyrics,
  currentTime,
}: {
  lyrics: JLF | null;
  currentTime: number;
}) {
  //const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const lyricRefs = useRef<HTMLDivElement[]>([]);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [hasJustLoaded, setHasJustLoaded] = useState(false);
  const [isMd, setIsMd] = useState(window.innerWidth > 1024);
  const [lastActiveLyric, setLastActiveLyric] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMd(window.innerWidth > 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lines = useMemo(() => lyrics?.lines.lines ?? [], [lyrics]);

  useEffect(() => {
    const activeLineIndex = lines.findIndex(
      (line, i) =>
        currentTime * 1000 >= line.time - 550 &&
        currentTime * 1000 + 550 <
          (lines[i + 1]?.time ?? lyrics?.lines.linesEnd),
    );
    // check whether we are at the start

    if (activeLineIndex !== -1 && activeLineIndex !== lastActiveLyric) {
      lyricRefs.current[activeLineIndex]?.scrollIntoView({
        behavior:
          isMd && hasJustLoaded && currentTime * 1000 > 3
            ? "smooth"
            : "instant",
        block: "center",
      });
      setLastActiveLyric(activeLineIndex);
      if (!hasJustLoaded) setHasJustLoaded(true);
    } else if (activeLineIndex === -1) {
      // scroll to topref
      topRef.current?.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [currentTime, isMd, hasJustLoaded, lyrics, lines, lastActiveLyric]);

  if (!lyrics) return null;

  return (
    <div className="flex flex-col hide-scrollbar w-full max-w-max">
      <div ref={topRef} className="top-[15vh]" />
      {lines.map((line, i) => {
        const segStatus = getLyricStatus(
          currentTime * 1000,
          line.time,
          lines[i + 1]?.time ?? lyrics.lines.linesEnd,
          // 500ms
          500,
        );

        return (
          <div
            key={i}
            className={`w-max max-w-full text-wrap transition-transform bg-transparent duration-0 mb-2 md:mb-4 lg:mb-10 xl:mb-12 py-2 text-left origin-left text-3xl md:text-4xl lg:text-6xl xl:text-7xl ${
              segStatus.isActive ? "scale-100" : "scale-90"
            } lg:transition-all lg:duration-500 ease-in-out`}
          >
            <div
              ref={(el) => (lyricRefs.current[i] = el!)}
              className={`top-[15vh] h-4 w-4 absolute rounded-full`}
            />
            {line.text || "· · ·"}
          </div>
        );
      })}
    </div>
  );
}
