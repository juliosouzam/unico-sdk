export type LogType = "INFO" | "WARN" | "ERROR" | "SUCCESS" | "DEBUG";

export interface ILogger {
  info(key: string, value: unknown): void;
  warn(key: string, value: unknown): void;
  error(key: string, value: unknown): void;
  success(key: string, value: unknown): void;
  debug(key: string, value: unknown): void;
}

export abstract class Logger implements ILogger {
  public info(key: string, value: unknown): void {
    this.log("INFO", key, value);
  }

  public warn(key: string, value: unknown): void {
    this.log("WARN", key, value);
  }

  public error(key: string, value: unknown): void {
    this.log("ERROR", key, value);
  }

  public success(key: string, value: unknown): void {
    this.log("SUCCESS", key, value);
  }

  public debug(key: string, value: unknown): void {
    this.log("DEBUG", key, value);
  }

  protected abstract log(type: LogType, key: string, value: unknown): void;
}
