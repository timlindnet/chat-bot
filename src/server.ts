import { ChatEnum, ChatService, ChatTypeOutputRoomsMap } from './chat-service';
import { FileListener, LogConfig } from './file-listener/FileListener';
import dayjs from 'dayjs';
import { aggregatedChatTypeOutputRooms } from './utils/aggregatedChatTypeOutputRooms';
import fs from 'node:fs';
import path from 'path';

const getLogConfigs = (): LogConfig[] => {
  const logConfigs: LogConfig[] = [];
  const files = fs.readdirSync(path.resolve(__dirname, 'configs'));
  files.forEach((file) => {
    const logFile = fs.readFileSync(path.resolve(__dirname, 'configs', file), 'utf8');
    logConfigs.push(JSON.parse(logFile));
  });
  return logConfigs;
};

const logConfigs = getLogConfigs();

if (logConfigs?.length === 0) {
  throw Error('No configs to load');
}

// Bot configuration
const runbot = async () => {
  const chatService = new ChatService();

  await chatService.connectChats(aggregatedChatTypeOutputRooms(logConfigs));

  for (const logConfig of logConfigs) {
    const listener = new FileListener(logConfig, {
      onFileChange: async (logConfig, newFileLines) => {
        if (!newFileLines.length) return;
        const newLog = newFileLines.length > 1 ? `${newFileLines.join('\n')}` : newFileLines.pop();
        const wrap = [`\``, `\``];
        const message = `${wrap[0]}${dayjs(new Date()).format('DD-MM-YYYY HH:mm:ss')} from ${logConfig.name}:${
          wrap[1]
        }\n ${newLog}`;
        chatService.sendToChats(logConfig.chats, message.replace(/^\s+|\s+$/g, ''));
      },
      onListenerInit: async (logConfig) => {
        chatService.sendToChats(logConfig.chats, `\`Listener started: ${logConfig.name}\``);
      },
    });
    await listener.start();
  }
};

runbot();
