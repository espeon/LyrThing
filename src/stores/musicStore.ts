import { DeskThing } from "deskthing-client";
import { SongData, SocketData } from "deskthing-client/dist/types";
import { Message, MessageType } from "../types/messages";
import lyricsStore from "./lyricsStore";

type MusicListener = (data: SongData) => Promise<void>;
export class MusicStore {
  private static instance: MusicStore;
  private deskthing: DeskThing;
  private listeners: ((data: SocketData) => void)[] = [];
  private musicListeners: MusicListener[] = [];
  private currentSong: SongData | null = null;

  constructor() {
    this.deskthing = DeskThing.getInstance();
    this.listeners.push(
      this.deskthing.on("music", this.handleMusic.bind(this)),
    );
    setTimeout(
      () =>
        this.deskthing.send({
          app: "client",
          type: "get",
          request: "song",
        }),
      1000,
    );
  }

  static getInstance(): MusicStore {
    if (!MusicStore.instance) {
      MusicStore.instance = new MusicStore();
    }
    return MusicStore.instance;
  }

  private async handleMusic(data: SocketData) {
    const song = data.payload;
    console.log("Got song", data);
    // if new song recognised, get the lyrics
    if (!this.currentSong || this.currentSong.track_name + this.currentSong.artist + this.currentSong.album !== song.track_name + song.artist + song.album) {
      lyricsStore.clearLyrics();
      const track: SongData = { ...song, thumbnail: null };
      this.deskthing.send(
        new Message(MessageType.LyricsUpdate, JSON.stringify(track)).toSocketData(
          "action",
        ),
      );
    }
    this.currentSong = song;
    if (this.currentSong != null) {
      this.musicListeners.forEach((listener) =>
        listener(this.currentSong as SongData),
      );
    }
  }

  getSong(): SongData | null {
    return this.currentSong;
  }

  setPlay(state: boolean) {
    if (this.currentSong) {
      this.currentSong.is_playing = state;
      this.musicListeners.forEach((listener) =>
        listener(this.currentSong as SongData),
      );
    }
  }

  on(listener: MusicListener): () => void {
    this.musicListeners.push(listener);
    return () => {
      this.musicListeners = this.musicListeners.filter((l) => l !== listener);
    };
  }

  off(listener: MusicListener) {
    this.musicListeners = this.musicListeners.filter((l) => l !== listener);
  }
}

export default MusicStore.getInstance();
