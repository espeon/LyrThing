import { SongData } from "deskthing-server";
import lrcToJlf from "./convertToJLF";
import { JLF } from "../src/types/lyrics";

const BASE_URL = "https://lrclib.net/api";

import { DeskThing } from "./index"

export default async function getCurrentLyrics(
  song: SongData
): Promise<JLF | string> {
    // build query string
    let query = new URLSearchParams();
    query.append("track_name", song.track_name);
    if(song.artist) query.append("artist_name", song.artist);
    if(song.album) query.append("album_name", song.album);

    

  let res = await fetch(BASE_URL + `/get?${query.toString()}`, {
    headers: {
      "User-Agent":
        "Deskthing/co.lutea.lyrthing (https://github.com/espeon/lyrthing)",
    },
  });

  if (!res.ok) {
    let j = await res.json()
    throw new Error(res.statusText + " " + j.name + ": " + j.message);
  }

  let data = await res.json();

  if (data.length == 0) {
    throw new Error("No lyrics found");
  }
  let lyrics = data;
  let jlf = lrcToJlf(lyrics.syncedLyrics, {
    Artist: lyrics.artistName,
    Title: lyrics.trackName,
    Album: lyrics.albumName,
  });
  return jlf;
}
