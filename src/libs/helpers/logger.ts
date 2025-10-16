import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.printf(({ level, message }) => {
        return ` [${level.toUpperCase()}]: ${message}`;
      }),
    ),
    transports: [new winston.transports.Console()],
  });

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  info(message: string) {
    this.logger.info(message);
  }
}
