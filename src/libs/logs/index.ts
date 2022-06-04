import { Logger, LogType } from "./logs";

export class ConsoleLog extends Logger {
  protected log(type: LogType, key: string, value: unknown): void {
    console.log(`[${type}] ${key}:`, value);
  }
}
