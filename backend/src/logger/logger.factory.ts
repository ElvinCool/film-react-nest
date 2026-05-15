import { LoggerService } from '@nestjs/common';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

export type LoggerType = 'dev' | 'json' | 'tskv';

export function createLogger(type: string | undefined): LoggerService {
  const normalized = (type ?? 'tskv').toLowerCase();
  switch (normalized) {
    case 'dev':
      return new DevLogger();
    case 'json':
      return new JsonLogger();
    case 'tskv':
    default:
      return new TskvLogger();
  }
}
