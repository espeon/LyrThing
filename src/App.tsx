import React, { useEffect } from "react";
import { DeskThing } from "deskthing-client";
import { SocketData, SongData } from "deskthing-client/dist/types";
import { MusicStore } from "./stores/musicStore";
import { CrossFade } from "react-crossfade-simple";
import { chooseTextColor, getAverageRGB } from "./helpers/getAvgColor";
import { ScrollingText } from "./components/scrollingText";
import { Message, MessageType } from "./types/messages";
import { useSmoothTimer } from "./hooks/useSmoothTimer";
import s2t from "./helpers/ms2";

interface SongInfo {
    duration: number;
    currentTime: number;
}

const App: React.FC = () => {
  const musicStore = MusicStore.getInstance();
  const [songData, setSongData] = React.useState<SongData | null>(
    musicStore.getSong()
  );
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);
  const [textColor, setTextColor] = React.useState<"black" | "white" | string>(
    "#888888"
  );
  const [songInfo, setSongInfo] = React.useState<SongInfo>({
    duration: 0,
    currentTime: 0,
  });
  const deskthing = DeskThing.getInstance();

  const trackProgress = useSmoothTimer({duration: songInfo.duration/1000, currentTime: songInfo.currentTime/1000, onUpdate: () => {}, isActivelyPlaying: songData?.is_playing});

  useEffect(() => {
    const onMusicUpdates = async (data: SongData) => {
      setSongData(data);
      console.log("getting music", data.is_playing);
      if (data.track_progress && data.track_duration) {
        trackProgress.setLocalTime(data.track_progress/1000);
        setSongInfo({
          duration: data.track_duration,
          currentTime: data.track_progress,
        })
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
    const rgb = async () =>{
      if (thumbnail != null) {
        try {
                  // set text colour based on thumbnail data
        let rgb = await getAverageRGB(thumbnail);
        if (rgb instanceof Error) {
            return deskthing.sendMessageToParent(new Message(MessageType.Error, rgb.message));
        }
        deskthing.sendMessageToParent(new Message(MessageType.SongUpdate, JSON.stringify({song: songData, rgb: rgb})));
        let textCol = chooseTextColor(rgb);
        setTextColor(textCol);
        console.log("text color", textCol);
        } catch (e: any) {
          console.error(e);
          return deskthing.sendMessageToParent(new Message(MessageType.Error, JSON.stringify(e)));
        }
      }}
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

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 spin blur-2xl obs-invis overflow-clip">
        <div className="absolute inset-0"></div>
        <CrossFade
          contentKey={(songData && songData?.thumbnail) ?? "mnpme"}
          timeout={500}
          style={{ backgroundColor: "black" }}
        >
          <img
            className="contrast-[85%] saturate-150 scale-150"
            src={
              songData?.thumbnail ??
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
            }
            alt=""
            height="20000"
            width="20000"
          />
        </CrossFade>
      </div>
      <CrossFade
        contentKey={songData ? songData?.track_name + songData?.artist : "none"}
        timeout={500}
      >
        <div className="relative flex flex-row w-screen h-full flex-1 items-center justify-center">
          <div className="w-screen absolute flex flex-row gap-2 items-center justify-center">
            <CrossFade
              contentKey={(songData && songData?.thumbnail) ?? "mnpme"}
              timeout={500}
              style={{ backgroundColor: "black", width: "25%", height: "25%" }}
            >
              <img
                className="w-full h-full"
                src={
                  songData?.thumbnail ??
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                }
                alt=""
              />
            </CrossFade>
            <div
              className="text-4xl max-w-min w-[calc(75%-4rem)] px-4"
              style={{ color: textColor }}
            >
              {songData ? (
                <>
                  <ScrollingText text={songData.track_name} />
                  {songData.album !== songData.track_name ? (<>
                    <ScrollingText text={songData.artist} className="text-3xl" />
                      <ScrollingText text={songData.album} className="text-3xl" />
                      </>
                  ): <ScrollingText text={songData.artist} />}
                  <div className="text-xl font-mono">{s2t(trackProgress.currentTime)}/{s2t(songInfo.duration/1000)}</div>
                </>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </CrossFade>
    </div>
  );
};

export default App;
