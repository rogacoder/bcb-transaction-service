import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);

  // RS > BCB: employ logging service here
  // RS > BCB: for this exercise: use the basic console logger from Nest
  public log(message: string, obj?: unknown): void {
    this.logger.log(`${message}`, obj || {});
  }
}
