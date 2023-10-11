import { ChatAdapter } from '../index';
import { driver } from '@rocket.chat/sdk';
import { ICallback } from '@rocket.chat/sdk/dist/config/driverInterfaces';
import { IMessage } from '@rocket.chat/sdk/dist/config/messageInterfaces';
import { commands } from '../../commands';

const { CHAT_BOT_ROCKETCHAT_HOST, CHAT_BOT_ROCKETCHAT_USER, CHAT_BOT_ROCKETCHAT_PASS, CHAT_BOT_ROCKETCHAT_SSL } =
  process.env;

export class RocketChat implements ChatAdapter {
  private userId?: string;
  public rooms: string[];

  constructor(rooms: string[]) {
    if (
      !CHAT_BOT_ROCKETCHAT_HOST ||
      !CHAT_BOT_ROCKETCHAT_USER ||
      !CHAT_BOT_ROCKETCHAT_PASS ||
      !CHAT_BOT_ROCKETCHAT_SSL
    ) {
      throw Error('Missing RocketChat environment variables');
    }

    this.rooms = rooms;
  }

  addRooms = (rooms: string[]) => {
    const uniqueSet = new Set(this.rooms);

    for (const str of rooms) {
      if (!uniqueSet.has(str)) {
        this.rooms.push(str);
        uniqueSet.add(str);
      }
    }

    return this.rooms;
  };

  connect = async () => {
    await driver.connect({ host: CHAT_BOT_ROCKETCHAT_HOST, useSsl: !!CHAT_BOT_ROCKETCHAT_SSL });

    this.userId = await driver.login({
      username: CHAT_BOT_ROCKETCHAT_USER,
      password: CHAT_BOT_ROCKETCHAT_PASS as string,
    });

    await driver.joinRooms(this.rooms);
    await driver.subscribeToMessages();

    driver.reactToMessages(this.processMessages);

    return true;
  };

  sendToRoom = async (message: string, room: string) => {
    await driver.sendToRoom(message, room);
    return true;
  };

  sendToRooms = async (message: string, rooms: string[]) => {
    for (const room of rooms) {
      await this.sendToRoom(message, room);
    }
    return true;
  };

  sendToAllRooms = async (message: string) => {
    for (const room of this.rooms) {
      await this.sendToRoom(message, room);
    }
    return true;
  };

  processMessages: ICallback = async (err, message: IMessage) => {
    if (!err && message !== undefined) {
      if (message.u?._id === this.userId || message.rid == null || !message.msg) return;

      // await driver.getRoomName(message.rid);

      if (Object.keys(commands).includes(message.msg)) {
        const response = commands[message.msg];
        if (response) {
          await driver.sendToRoomId(response, message.rid);
        }
      }
    }
  };
}
