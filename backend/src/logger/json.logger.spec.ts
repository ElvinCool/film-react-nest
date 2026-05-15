import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    debugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatMessage', () => {
    it('возвращает валидный JSON со всеми полями', () => {
      const formatted = logger.formatMessage('log', 'hello', 'extra');
      const parsed = JSON.parse(formatted);
      expect(parsed).toEqual({
        level: 'log',
        message: 'hello',
        optionalParams: ['extra'],
      });
    });

    it('пустой массив optionalParams когда дополнительных аргументов нет', () => {
      const parsed = JSON.parse(logger.formatMessage('log', 'hi'));
      expect(parsed.optionalParams).toEqual([]);
    });

    it('корректно сериализует объект как message', () => {
      const parsed = JSON.parse(logger.formatMessage('log', { user: 'alice' }));
      expect(parsed.message).toEqual({ user: 'alice' });
    });
  });

  describe('методы логгера', () => {
    it('log вызывает console.log с JSON-строкой и level=log', () => {
      logger.log('hello');
      expect(logSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('hello');
    });

    it('error вызывает console.error с level=error', () => {
      logger.error('boom');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('boom');
    });

    it('warn вызывает console.warn с level=warn', () => {
      logger.warn('careful');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(warnSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('warn');
    });

    it('debug вызывает console.debug с level=debug', () => {
      logger.debug('inspect');
      expect(debugSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(debugSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('debug');
    });

    it('verbose выводит сообщение с level=verbose', () => {
      logger.verbose('details');
      expect(logSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('verbose');
    });

    it('передаёт дополнительные параметры в optionalParams', () => {
      logger.log('msg', 'ctx', 42);
      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed.optionalParams).toEqual(['ctx', 42]);
    });
  });
});
