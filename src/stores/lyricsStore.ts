import { DeskThing } from "deskthing-client";
import { SocketData } from "deskthing-client/dist/types";
import { JLF } from "../types/lyrics";

type LyricsListener = (lyrics: JLF) => Promise<void>;

export class LyricsStore {
  private static instance: LyricsStore;
  private deskthing: DeskThing;
  private listeners: ((data: SocketData) => void)[] = [];
  private lyricsListeners: LyricsListener[] = [];
  private currentLyrics: JLF | null = null;


  constructor() {
    this.deskthing = DeskThing.getInstance();
    this.listeners.push(
      this.deskthing.on("co.lutea.lyrthing", this.handleLyrics.bind(this))
    );
  }

  static getInstance(): LyricsStore {
    if (!LyricsStore.instance) {
        LyricsStore.instance = new LyricsStore();
    }
    return LyricsStore.instance;
  }


  private async handleLyrics(data: SocketData) {
    console.log("Got lyrics", data);

    this.deskthing.sendMessageToParent({
      app: "co.lutea.lyrthing",
      type: "log",
      payload: "Successfully got lyrics" + JSON.stringify(data),
    })

    this.currentLyrics = data.payload;
    if (this.currentLyrics != null) {
      this.lyricsListeners.forEach((listener) =>
        listener(this.currentLyrics as JLF)
      );
    }
  }

  getLyrics(): JLF | null {
    return this.currentLyrics;
  }

  on(listener: LyricsListener): () => void {
    this.lyricsListeners.push(listener);
    return () => {
      this.lyricsListeners = this.lyricsListeners.filter((l) => l !== listener);
    };
  }

  off(listener: LyricsListener) {
    this.lyricsListeners = this.lyricsListeners.filter((l) => l !== listener);
  }
}

export default LyricsStore.getInstance();
