
import Lyrics from "./lyrics";

export interface LyricsLayoutProps {
    trackProgress: number;
}

export default function LyricsLayout({
  trackProgress,
}: LyricsLayoutProps) {
  return (
    <div className="h-full w-full">
      <Lyrics trackProgress={trackProgress} />
    </div>
  );
}
