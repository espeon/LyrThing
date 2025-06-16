import { SocketData, SongData } from '@deskthing/types';
import { Message, MessageType } from '../src/types/messages';
import getCurrentLyrics from './lyricsHandler';
import { DeskThing } from '@deskthing/server'


// Required export of this exact name for the server to connect
console.log("Starting!")
const start = async () => {
  console.log("Starting!")
    DeskThing.on('action', (m: SocketData) => {
        let msg = Message.fromJson(m.payload?.toString() || '');
        console.log("Client sent a request for " + msg.type + " " + msg.message)

        if (msg.type == 'lyrics') {
          let query = JSON.parse(msg.message) as SongData
          console.log("Handling lyrics request -" + JSON.stringify(query));
          getCurrentLyrics(query).then((lyrics) => {
            if (lyrics != null) {
              new Message(MessageType.LyricsUpdate, JSON.stringify(lyrics));
              DeskThing.send({
                type: 'lyrics',
                payload: lyrics,
              });
            }
          }).catch((err) => {
            // send lyrics error to client
            DeskThing.send({
              type: 'lyrics',
              payload: {
                err: err.message
              },
            });
          });
        } else if (msg.type == 'log') {
          console.log("Client - " + msg.message);
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
