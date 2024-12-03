import { DeskThing as DK, SocketData, SongData } from 'deskthing-server';
import { Message, MessageType } from '../src/types/messages';
import getCurrentLyrics from './lyricsHandler';
const DeskThing = DK.getInstance();
export { DeskThing } // Required export of this exact name for the server to connect
console.log("Starting!")
const start = async () => {
  console.log("Starting!")
    DeskThing.on('action', (m: SocketData) => {
        let msg = Message.fromJson(m.payload?.toString() || '');
        DeskThing.sendLog("Client sent a request for " + msg.type + " " + msg.message)

        if (msg.type == 'lyrics') {
          let query = JSON.parse(msg.message) as SongData
          DeskThing.sendLog("Handling lyrics request -" + JSON.stringify(query));
          getCurrentLyrics(JSON.parse(msg.message) as SongData).then((lyrics) => {
            if (lyrics != null) {
              let msg = new Message(MessageType.LyricsUpdate, JSON.stringify(lyrics));
              DeskThing.sendDataToClient({
                type: 'lyrics',
                payload: lyrics,
              });
            }
          }).catch((err) => {
            DeskThing.sendError(err);
          })
        } else if (msg.type == 'log') {
          DeskThing.sendLog("Client - " + msg.message);
        }
    })
} 

const stop = async () => {
    // Function called when the server is stopped
}

// Main Entrypoint of the server
DeskThing.on('start', start)

// Main exit point of the server
DeskThing.on('stop', stop)
