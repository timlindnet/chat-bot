import { ChatEnum, ChatService, ChatTypeOutputRoomsMap } from './chat-service';
import { FileListener, LogConfig } from './file-listener/FileListener';
import dayjs from 'dayjs';
import { aggregatedChatTypeOutputRooms } from './utils/aggregatedChatTypeOutputRooms';

const logConfigs: LogConfig[] = [
  {
    name: 'example',
    path: 'example.txt',
    chats: [
      {
        type: ChatEnum.ROCKET_CHAT,
        outputRooms: ['botspam'],
      },
    ],
    listeningRules: [
      {
        rule: /Hello|world/,
      },
    ],
  },
];

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
