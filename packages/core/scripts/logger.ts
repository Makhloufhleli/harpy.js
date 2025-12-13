/**
 * Logger utility to format logs matching NestJS style
 * Format: [Harpy] PID  - DATE, TIME     LEVEL [Context] Message +Xms
 */

const pid = process.pid;

function getTimestamp(): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-US");
  const time = now.toLocaleTimeString("en-US");
  return `${date}, ${time}`;
}

export class Logger {
  private context: string;
  private lastLogTime: number = Date.now();

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, levelColor: string): string {
    const timestamp = getTimestamp();
    const elapsed = Date.now() - this.lastLogTime;
    this.lastLogTime = Date.now();
    
    const harpyPid = `\x1b[32m[Harpy] ${pid}\x1b[0m`;  // green
    const timestampFormatted = `\x1b[37m${timestamp}\x1b[0m`;  // white
    const levelColored = `\x1b[${levelColor}m${level.padEnd(5)}\x1b[0m`;
    const contextColored = `\x1b[33m[${this.context}]\x1b[0m`;  // yellow
    const messageColored = `\x1b[${levelColor}m${message}\x1b[0m`;
    const elapsedColored = `\x1b[33m+${elapsed}ms\x1b[0m`;  // yellow
    
    return `${harpyPid}  - ${timestampFormatted}     ${levelColored} ${contextColored} ${messageColored} ${elapsedColored}`;
  }

  log(message: string): void {
    console.log(this.formatMessage("LOG", message, "32")); // green
  }

  error(message: string): void {
    console.error(this.formatMessage("ERROR", message, "31")); // red
  }

  warn(message: string): void {
    console.warn(this.formatMessage("WARN", message, "33")); // yellow
  }

  verbose(message: string): void {
    console.log(this.formatMessage("LOG", message, "36")); // cyan
  }
}
