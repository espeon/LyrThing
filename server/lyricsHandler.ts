import { SongData } from "deskthing-server";
import { Message, MessageType } from "../src/types/messages";
import lrcToJlf from "./convertToJLF";
import { JLF } from "../src/types/lyrics";

const BASE_URL = "https://lrclib.net/api"

export default async function getCurrentLyrics(song: SongData): Promise<JLF | string> {
    // join together all identifying info (name artist album)
    let query = `${song.track_name} ${song.artist ? song.artist : ''} ${song.album ? song.album : ''}`;
    // fetch lyrics
    let res = await fetch(BASE_URL + `/search?q=${query}`)

    if (!res.ok) {
        return res.statusText
    }

    let data = await res.json();
    if (data.length == 0) {
        return "No lyrics found"
    }
    let lyrics = data[0];
    return lrcToJlf(lyrics.syncedLyrics, { Artist: lyrics.artistName, Title: lyrics.trackName, Album:lyrics.albumName });

}