import { LoggerService } from '@nestjs/common';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export class AppLogger {
  static create(): LoggerService {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('API', {
              colors: isDevelopment,
              prettyPrint: isDevelopment,
            }),
          ),
        }),
      ],
      level: isDevelopment ? 'debug' : 'info',
    });
  }
}
