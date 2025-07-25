export class TestLogger {
  private logs: string[] = [];

  log = (message: string): void => {
    this.logs.push(message);
  }

  getLastLog(): string | undefined {
    return this.logs[this.logs.length - 1];
  }

  getAllLogs(): string[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }

  getLogCount(): number {
    return this.logs.length;
  }

  hasBeenCalled(): boolean {
    return this.logs.length > 0;
  }
}
