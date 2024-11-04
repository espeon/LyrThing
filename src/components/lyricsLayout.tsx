
import Lyrics from "./lyrics";

export interface LyricsLayoutProps {
    trackProgress: number;
}

export default function LyricsLayout({
  trackProgress,
}: LyricsLayoutProps) {
  return (
    <div className="h-full w-full pl-2">
      <Lyrics trackProgress={trackProgress} />
    </div>
  );
}
