import React, { useEffect } from "react";
import { DeskThing } from "deskthing-client";
import { SocketData, SongData } from "deskthing-client/dist/types";
import { MusicStore } from "./stores/musicStore";
import { CrossFade } from "react-crossfade-simple";
import {
  chooseTextColor,
  colorArrToCSS,
  getAverageRGB,
  getComplementaryColor,
  getMatchingOppositeColor,
} from "./helpers/getAvgColor";
import { ScrollingText } from "./components/scrollingText";
import { Message, MessageType } from "./types/messages";
import { useSmoothTimer } from "./hooks/useSmoothTimer";
import { s2t } from "./helpers/ms2";
import MicVocal from "./components/icons/micVocal";
import { clsx } from "clsx";
import LyricsLayout from "./components/lyricsLayout";

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
  const [textColor, setTextColor] = React.useState<"rgba(10 10 10 var(--tw-text-opacity))" | "rgba(245 245 245 var(--tw-text-opacity))" | string>(
    "#888888"
  );
  const [albumColor, setAlbumColor] = React.useState<[number, number, number]>([
    80, 80, 80,
  ]);
  const [songInfo, setSongInfo] = React.useState<SongInfo>({
    duration: 0,
    currentTime: 0,
  });

  const [currentMode, setCurrentMode] = React.useState<"track" | "lyrics">(
    "track"
  );
  const deskthing = DeskThing.getInstance();

  const trackProgress = useSmoothTimer({
    duration: songInfo.duration / 1000,
    currentTime: songInfo.currentTime / 1000,
    throttleBy: 250,
    isActivelyPlaying: songData?.is_playing,
  });

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
      if (data.thumbnail && data.thumbnail !== thumbnail) {
        setThumbnail(data.thumbnail);
      }
    };

    const off = musicStore.on(onMusicUpdates);

    return () => {
      off();
    };
  });

  useEffect(() => {
    const rgb = async () => {
      if (thumbnail != null) {
        try {
          // set text colour based on thumbnail data
          let rgb = await getAverageRGB(thumbnail);
          if (rgb instanceof Error) {
            return deskthing.sendMessageToParent(
              new Message(MessageType.Error, rgb.message)
            );
          }
          deskthing.sendMessageToParent(
            new Message(
              MessageType.SongUpdate,
              JSON.stringify({ song: songData, rgb: rgb })
            )
          );
          let textCol = chooseTextColor(rgb);
          setTextColor(textCol);
          setAlbumColor(rgb);
          console.log("text color", textCol);
        } catch (e: any) {
          console.error(e);
          return deskthing.sendMessageToParent(
            new Message(MessageType.Error, JSON.stringify(e))
          );
        }
      }
    };
    rgb();
  }, [thumbnail]);

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

  let albumColorCSS = colorArrToCSS(albumColor);

  return (
    <div className="relative w-screen h-screen overflow-hidden rounded-xl opacity-100" style={{ backgroundColor: albumColorCSS }}>
      <div className="absolute inset-0 obs-invis">
        <div className="absolute inset-0"></div>
        <CrossFade
          contentKey={(songData && songData?.thumbnail) ?? "mnpme"}
          timeout={1000}
          style={{ backgroundColor: albumColorCSS }}
        >
          <img
            className={`blur-3xl scale-125 saturate-150 contrast-75 ${textColor === "rgba(245 245 245 var(--tw-text-opacity))" ? "brightness-110" : "brightness-75"} brightness-1 object-cover object-center w-screen h-screen`}
            src={
              songData?.thumbnail ??
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
            }
            height="100%"
          />
        </CrossFade>
      </div>
      <CrossFade
        contentKey={
          songData
            ? songData?.track_name + songData?.artist + currentMode
            : "none"
        }
        timeout={500}
      >
        <div className="relative flex flex-col w-screen h-full items-center justify-center">
          {songData ? (
            <>
              <div className="w-screen h-screen max-h-screen flex flex-col justify-evenly flex-1 lg:p-16">
                <div className="max-h-screen w-screen flex flex-row gap-2 items-center justify-center">
                  <div
                    className="h-min max-h-[80vh] w-full aspect-square"
                    style={{ width: "30%", color: textColor }}
                  >
                    <CrossFade
                      contentKey={(songData && songData?.thumbnail) ?? "mnpme"}
                      timeout={500}
                    >
                      <img
                        className="w-full h-full object-center aspect-square rounded-lg border-2 shadow-lg"
                        src={
                          songData?.thumbnail ??
                          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                        }
                        alt=""
                        style={
                          {
                            borderColor: colorArrToCSS(
                              getComplementaryColor(albumColor),
                              0.35
                            ),
                            "--tw-shadow-color": colorArrToCSS(albumColor, 0.5),
                          } as React.CSSProperties
                        }
                      />
                    </CrossFade>
                    {currentMode != "track" && (
                      <div className="w-full pt-2">
                        <ScrollingText
                          text={songData.track_name}
                          className="drop-shadow-lg text-2xl lg:text-4xl xl:text-6xl"
                        />
                        <ScrollingText
                          text={songData.artist}
                          className="text-2xl lg:text-4xl xl:text-6xl"
                        />
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
                          <ScrollingText text={songData.artist} className="text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl" />
                        )}
                        <div className="text-xl font-mono flex">
                        {s2t(trackProgress.currentTime)}
                          /{s2t(songInfo.duration / 1000)}
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
          <div className="w-screen px-4 pb-4 -mt-14 flex flex-col items-start justify-center gap-2">
            {/* <div
                  className="w-full h-2 rounded-lg"
                  style={{
                    backgroundColor: colorArrToCSS(
                      getComplementaryColor(albumColor),
                      50
                    ),
                  }}
                >
                  <div
                    className="h-2 mt-2 border rounded-full"
                    style={{
                      width: `${
                        trackProgress.currentTime / (songInfo.duration / 100000)
                      }%`,
                      backgroundColor: colorArrToCSS(albumColor),
                      borderColor: colorArrToCSS(
                        getComplementaryColor(albumColor),
                        33
                      ),
                    }}
                  ></div>
                </div> */}
            <button
              className={clsx(
                currentMode === "lyrics" && "bg-opacity-75",
                `w-12 h-12 rounded-full p-1 transition-all duration-300 bg-opacity-55`
              )}
              style={{
                backgroundColor: colorArrToCSS(
                  getMatchingOppositeColor(albumColor)
                ),
              }}
              onClick={(e) => {
                setCurrentMode(currentMode === "lyrics" ? "track" : "lyrics");
              }}
              onTouchEndCapture={(e) => {
                setCurrentMode(currentMode === "lyrics" ? "track" : "lyrics");
              }}
            >
              <MicVocal className="w-full h-full" />
            </button>
          </div>
        </div>
      </CrossFade>
    </div>
  );
};

export default App;
