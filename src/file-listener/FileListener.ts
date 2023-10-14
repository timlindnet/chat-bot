import _ from 'lodash';
import watch from 'node-watch';
import fs, { WatchOptions } from 'node:fs';
import { Chat } from '../chat-service';

export interface ListeningRule {
  rule: RegExp;
}

export interface LogConfig {
  name: string;
  path: string;
  chats: Chat[];
  listeningRules?: ListeningRule[];
  currentLinePosition?: number;
}

export interface FileListenerSettings {
  onFileChange: (logConfig: LogConfig, newLines: string[]) => void;
  onListenerInit?: (logConfig: LogConfig) => void;
  watchOptions?:
    | (WatchOptions & {
        encoding: 'buffer';
      })
    | 'buffer';
}

const defaultSettings: FileListenerSettingsInternal = {
  onFileChange: () => ({}),
  watchOptions: {
    persistent: true,
    recursive: false,
    encoding: 'utf8',
  },
};

interface FileListenerSettingsInternal extends Omit<FileListenerSettings, 'watchOptions'> {
  watchOptions: WatchOptions;
}

export class FileListener {
  public logConfig: LogConfig;
  public settings: FileListenerSettingsInternal = defaultSettings;

  constructor(logConfig: LogConfig, settings: FileListenerSettings) {
    this.logConfig = logConfig;
    this.settings = _.merge(this.settings, settings);
  }

  start = async () => {
    this.settings.onListenerInit && this.settings.onListenerInit(this.logConfig);
    watch(this.logConfig.path, this.settings.watchOptions, async () => {
      const fileLines = fs
        .readFileSync(this.logConfig.path, 'utf8')
        .split('\n')
        .filter((x) => x && this.logConfig.listeningRules?.some((y) => x.match(new RegExp(y.rule))));
      const newFileLines = fileLines.slice(this.logConfig.currentLinePosition);
      this.logConfig.currentLinePosition = fileLines.length;

      this.settings.onFileChange(
        this.logConfig,
        newFileLines.filter((x) => x)
      );
    });
  };
}
