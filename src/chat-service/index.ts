import { RocketChat } from './services/RocketChat';

export interface ChatAdapter {
  rooms: string[];
  connect: (server: string, username: string, password: string, rooms: string[]) => Promise<boolean>;
  sendToRoom?: (message: string, room: string) => Promise<boolean>;
  sendToRooms?: (message: string, room: string[]) => Promise<boolean>;
  sendToAllRooms?: (message: string) => Promise<boolean>;
}

export enum ChatEnum {
  ROCKET_CHAT = 'ROCKET_CHAT',
}

export interface Chat {
  type: ChatEnum;
  outputRooms: string[];
}

type ChatAdapterMap = {
  [ChatEnum.ROCKET_CHAT]?: RocketChat;
};

export type ChatTypeOutputRoomsMap = {
  [key in ChatEnum]: string[];
};

export class ChatService {
  public chats: ChatAdapterMap = {
    [ChatEnum.ROCKET_CHAT]: undefined,
  };

  constructor() {}

  connectChat = async (type: ChatEnum, rooms: string[]) => {
    let serviceInstance;
    if (!this.chats[type]) {
      // Connect
      switch (type) {
        case ChatEnum.ROCKET_CHAT:
          serviceInstance = new RocketChat(rooms);
          await serviceInstance.connect();

          this.chats[type] = serviceInstance;
          break;
        default:
        // Do nothing
      }
    } else {
      serviceInstance = this.chats[type];
    }
    return serviceInstance;
  };

  connectChats = async (chatTypeOutputRooms: ChatTypeOutputRoomsMap) => {
    for (const [type, rooms] of Object.entries(chatTypeOutputRooms)) {
      const chatType = type as ChatEnum;
      await this.connectChat(chatType, rooms);
    }
    return true;
  };

  sendToChats = async (chats: Chat[], message: string) => {
    for (const chat of chats) {
      await this.chats[chat.type]?.sendToRooms(message, chat.outputRooms);
    }
    return true;
  };
}
