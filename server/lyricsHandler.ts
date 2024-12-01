import { SongData } from "deskthing-server";
import lrcToJlf from "./convertToJLF";
import { JLF } from "../src/types/lyrics";

const BASE_URL = "https://lrclib.net/api";

import { DeskThing } from "./index";

export default async function getCurrentLyrics(
  song: SongData,
): Promise<JLF | string> {
  // build query string
  const query = new URLSearchParams();
  query.append("track_name", song.track_name);
  if (song.artist && song.artist != "")
    query.append("artist_name", song.artist);
  if (song.album && song.album != "") query.append("album_name", song.album);

  DeskThing.sendLog(
    "Sending request for lyrics: https://lrclib.net/api/get?" +
      query.toString(),
  );

  const res = await fetch(BASE_URL + `/get?${query.toString()}`, {
    headers: {
      "User-Agent":
        "Deskthing/co.lutea.lyrthing (https://github.com/espeon/lyrthing)",
    },
  });

  if (!res.ok) {
    const j = await res.json();
    throw new Error(res.statusText + " " + j.name + ": " + j.message);
  }

  const data = await res.json();

  DeskThing.sendLog("Got response from lrclib.net track id:" + data.id);

  if (data.length == 0) {
    throw new Error("No lyrics found");
  }
  const lyrics = data;
  const jlf = lrcToJlf(lyrics.syncedLyrics, {
    Artist: lyrics.artistName,
    Title: lyrics.trackName,
    Album: lyrics.albumName,
  });
  return jlf;
}
