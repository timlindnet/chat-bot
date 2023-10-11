import { ChatTypeOutputRoomsMap } from '../chat-service';
import { LogConfig } from '../file-listener/FileListener';

/**
 * Aggregates output rooms for each chat type from an array of log configurations.
 *
 * @param logConfigs - An array of log configurations containing chat information.
 * @returns An object with chat types as keys and arrays of output rooms as values.
 * @example
 * const logConfigs: LogConfig[] = [
 *   {
 *     name: 'example',
 *     path: 'example.txt',
 *     chats: [
 *       {
 *         type: ChatEnum.ROCKET_CHAT,
 *         outputRooms: ['botspam'],
 *       },
 *     ],
 *     listeningRules: [
 *       {
 *         rule: /Hello|world/,
 *       },
 *     ],
 *   },
 * ];
 * const result = aggregatedChatTypeOutputRooms(logConfigs);
 * // Result: { ROCKET_CHAT: ['botspam'] }
 */
export const aggregatedChatTypeOutputRooms = (logConfigs: LogConfig[]) =>
  logConfigs.reduce((result, logConfig) => {
    logConfig.chats.forEach((chat) => {
      const { type, outputRooms } = chat;

      if (!result[type]) {
        result[type] = [];
      }

      result[type] = [...result[type], ...outputRooms];
    });

    return result;
  }, {} as ChatTypeOutputRoomsMap);
