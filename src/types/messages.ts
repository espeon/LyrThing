import { SocketData } from "deskthing-server";

export enum FnType {
  getAverageRGB = "getAverageRGB",
}

export enum MessageType {
  SongUpdate = "song",
  LyricsUpdate = "lyrics",
  RequestAction = "action",
  Error = "error",
  Log = "log",
  CallFunction = "callFunction",
}

export class Message {
  type: MessageType;
  message: string;
  function?: FnType | null;

  constructor(type: MessageType, message: string, functionType: FnType | null = null) {
    this.type = type;
    this.message = message;
    this.function = functionType;
  }

  toString() {
    return encodeMessageToJson(this);
  }

  toSocketData(type: string): SocketData {
    return {
        type,
        app: "developer-app",
        payload: JSON.stringify(this),
        request: this.function?.toString() || undefined
    };
  }

  static fromJson(json: string): Message {
    return parseMessageFromJson(json, JSON.parse(json).type as MessageType);
  }
}

 function parseMessageFromJson(json: string, type: MessageType): Message {
  const message = JSON.parse(json) as Message;
  if (message.type !== type) {
    throw new Error(`Expected message type ${type} but got ${message.type}. Message: ${json}`);
  }
  return message;
}

 function encodeMessageToJson(message: Message): string {
  return JSON.stringify(message);
}
