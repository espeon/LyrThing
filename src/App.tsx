import React, { useEffect, useMemo, useRef } from "react";
import { DeskThing } from "deskthing-client";
import { SocketData, SongData } from "deskthing-client/dist/types";
import { MusicStore } from "./stores/musicStore";
import { CrossFade as CrossFadeSimple } from "react-crossfade-simple";
import { ScrollingText } from "./components/scrollingText";
import { useSmoothTimer } from "./hooks/useSmoothTimer";
import { s2t } from "./helpers/ms2";
import MicVocal from "./components/icons/micVocal";
import { clsx } from "clsx";
import LyricsLayout from "./components/lyricsLayout";
import { useAlbumColors } from "./hooks/useAlbumColors";
import MeshBackground from "./components/MeshBackground";
import { chooseTextColor, getAverageColor } from "./helpers/getAvgColor";
import useSwipe from "./hooks/useSwipe";
import { SwipeHandler, PagesType } from "./components/swipeHandler";

// import crossfade if we are bigger than md
const isMd = window.innerWidth > 1024;
const CrossFade = isMd ? CrossFadeSimple : React.Fragment;

export interface SongInfo {
  duration: number;
  currentTime: number;
}

const App: React.FC = () => {
  const musicStore = MusicStore.getInstance();
  const [songData, setSongData] = React.useState<SongData | null>(
    musicStore.getSong()
  );
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);
  const [textColor, setTextColor] = React.useState<
    | "rgba(10 10 10 var(--tw-text-opacity))"
    | "rgba(245 245 245 var(--tw-text-opacity))"
    | string
  >("#ccc");
  const [songInfo, setSongInfo] = React.useState<SongInfo>({
    duration: 0,
    currentTime: 0,
  });

  const [currentMode, setCurrentMode] = React.useState<PagesType>("track");

  const albumColors = useAlbumColors(thumbnail);

  const deskthing = DeskThing.getInstance();

  // calculate text color
  useMemo(() => {
    if (albumColors.isTransitioning) return;
    const { r, g, b } = getAverageColor(albumColors.colors);

    setTextColor(chooseTextColor([r, g, b]));
  }, [albumColors]);

  const trackProgress = useSmoothTimer({
    duration: songInfo.duration / 1000,
    currentTime: songInfo.currentTime / 1000,
    throttleBy: 250,
    isActivelyPlaying: songData?.is_playing,
  });

  const swipeRef = useRef<HTMLDivElement>(null);
  const directions = useSwipe(swipeRef);

  useEffect(() => {
    const onMusicUpdates = async (data: SongData) => {
      setSongData(data);
      if (data.track_progress && data.track_duration) {
        trackProgress.setLocalTime(data.track_progress / 1000);
        setSongInfo({
          duration: data.track_duration,
          currentTime: data.track_progress,
        });
      }
      if (data?.thumbnail && data.thumbnail && data.thumbnail !== null) {
        console.log("Setting thumbnail");
        setThumbnail(data.thumbnail); // Set the thumbnail URL with real data when available
      }
    };

    const off = musicStore.on(onMusicUpdates);

    return () => {
      off();
    };
  });

  useEffect(() => {
    const onAppData = async (data: SocketData) => {
      console.log("Received data from the server!");
      console.log(data);
    };
    const removeListener = deskthing.on("co.lutea.lyrthing", onAppData);

    return () => {
      removeListener();
    };
  });

  return (
    <div
      className="relative w-screen h-screen overflow-hidden rounded-xl opacity-100"
      style={{ backgroundColor: albumColors[0] }}
      ref={swipeRef}
    >
      <div className="absolute inset-0 obs-invis">
        <div className="absolute inset-0"></div>
        {/* <img
            className={`blur-3xl scale-125 saturate-150 contrast-75 ${textColor === "rgba(245 245 245 var(--tw-text-opacity))" ? "brightness-110" : "brightness-75"} brightness-1 object-cover object-center w-screen h-screen`}
            src={
              songData?.thumbnail ??
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
            }
            height="100%"
          /> */}
        <MeshBackground colors={albumColors.colors} />
      </div>
      <CrossFade
        contentKey={
          songData
            ? songData?.track_name + songData?.artist + currentMode
            : "none"
        }
        timeout={500}
      >
        <div
          className="relative flex flex-col w-screen h-full items-center justify-center"
          
        >
          {songData ? (
            <>
              <div className="w-screen h-screen max-h-screen flex flex-col justify-evenly flex-1 lg:px-16">
                <div className="max-h-screen w-screen flex flex-row gap-2 items-center justify-center">
                  <div
                    className="h-min max-h-[70vh] lg:max-w-[25vw] w-full aspect-square place-items-center"
                    style={{ width: "30%", color: textColor }}
                  >
                    <CrossFade contentKey={thumbnail ?? "mnpme"} timeout={500}>
                      <img
                        className="w-full h-full object-center aspect-square rounded-lg border-2 shadow-lg"
                        src={
                          thumbnail ??
                          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                        }
                        alt=""
                        style={
                          {
                            borderColor: albumColors.colors[3] + "33",
                            "--tw-shadow-color": albumColors.colors[3] + "99",
                          } as React.CSSProperties
                        }
                      />
                    </CrossFade>
                    {currentMode != "track" && (
                      <div className="flex flex-col w-full pt-2">
                        <div className="flex-1">
                          <ScrollingText
                            text={songData.track_name}
                            className="drop-shadow-lg text-2xl lg:text-3xl xl:text-6xl"
                          />
                          <ScrollingText
                            text={songData.artist}
                            className="text-2xl lg:text-3xl xl:text-6xl"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="transition-[width] duration-500 max-w-min w-[calc(70%-3rem)] lg:w-[calc(60%)] lg:ml-2 lg:mr-8"
                    style={{
                      color: textColor,
                      padding: songData ? "1rem" : "0",
                    }}
                  >
                    {currentMode === "lyrics" ? (
                      <LyricsLayout trackProgress={trackProgress.currentTime} />
                    ) : songData ? (
                      <>
                        <ScrollingText
                          text={songData.track_name}
                          className="drop-shadow-lg text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
                        />
                        {songData.album !== songData.track_name ? (
                          <>
                            <ScrollingText
                              text={songData.artist}
                              className="text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
                            />
                            <ScrollingText
                              text={songData.album}
                              className="text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
                            />
                          </>
                        ) : (
                          <ScrollingText
                            text={songData.artist}
                            className="text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
                          />
                        )}
                        <div className="text-xl font-mono flex">
                          {s2t(trackProgress.currentTime)}/
                          {s2t(songInfo.duration / 1000)}
                        </div>
                      </>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-screen h-full flex flex-row items-center justify-center space-x-4">
              <span className="sr-only">Loading...</span>
              <div className="h-10 w-10 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-10 w-10 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-10 w-10 bg-white rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      </CrossFade>
      <SwipeHandler
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        directions={directions}
      />
    </div>
  );
};

export default App;
