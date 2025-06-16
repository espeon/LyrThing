import { DeskThing } from '@deskthing/client';
import { JLF } from "../types/lyrics";
import { SocketData } from '@deskthing/types';

type LyricsListener = (lyrics: JLF) => Promise<void>;

export class LyricsStore {
  private static instance: LyricsStore;
  private listeners: ((data: SocketData) => void)[] = [];
  private lyricsListeners: LyricsListener[] = [];
  private currentLyrics: JLF | null = null;

  constructor() {
    this.listeners.push(
      DeskThing.on("lyrics", this.handleLyrics.bind(this)),
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

    DeskThing.send({
      app: "co.lutea.lyrthing",
      type: "log",
      payload: "Successfully got lyrics",
    });

    this.currentLyrics = data.payload;
    if (this.currentLyrics != null) {
      this.lyricsListeners.forEach((listener) =>
        listener(this.currentLyrics as JLF),
      );
    }
  }

  getLyrics(): JLF | null {
    return this.currentLyrics;
  }

  clearLyrics() {
    this.currentLyrics = null;
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
