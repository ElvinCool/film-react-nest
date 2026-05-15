import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const parseTskv = (raw: string): Record<string, string> => {
    expect(raw.endsWith('\n')).toBe(true);
    const body = raw.slice(0, -1);
    const result: Record<string, string> = {};
    for (const pair of body.split('\t')) {
      const idx = pair.indexOf('=');
      result[pair.slice(0, idx)] = pair.slice(idx + 1);
    }
    return result;
  };

  describe('formatMessage', () => {
    it('строка заканчивается \\n', () => {
      expect(logger.formatMessage('log', 'hello')).toMatch(/\n$/);
    });

    it('пары ключ=значение разделены табуляцией', () => {
      const formatted = logger.formatMessage('log', 'hello');
      const body = formatted.slice(0, -1);
      const pairs = body.split('\t');
      expect(pairs.length).toBeGreaterThanOrEqual(3);
      for (const pair of pairs) {
        expect(pair).toMatch(/^[^=]+=.*/);
      }
    });

    it('содержит поля time, level и message', () => {
      const parsed = parseTskv(logger.formatMessage('log', 'hello'));
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('hello');
      expect(parsed.time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('экранирует управляющие символы в значениях', () => {
      const parsed = parseTskv(
        logger.formatMessage('log', 'line1\nline2\twith tab'),
      );
      expect(parsed.message).toBe('line1\\nline2\\twith tab');
    });

    it('добавляет optionalParams в виде JSON-массива когда они есть', () => {
      const parsed = parseTskv(
        logger.formatMessage('log', 'msg', 'context', 1),
      );
      expect(parsed.optionalParams).toBe('["context",1]');
    });

    it('не добавляет optionalParams когда дополнительных аргументов нет', () => {
      const parsed = parseTskv(logger.formatMessage('log', 'msg'));
      expect(parsed.optionalParams).toBeUndefined();
    });

    it('сериализует объект-message через JSON.stringify', () => {
      const parsed = parseTskv(logger.formatMessage('log', { user: 'a' }));
      expect(parsed.message).toBe('{"user":"a"}');
    });
  });

  describe('методы логгера', () => {
    it('log пишет в stdout с level=log', () => {
      logger.log('hello');
      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const parsed = parseTskv(stdoutSpy.mock.calls[0][0] as string);
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('hello');
    });

    it('error пишет в stderr с level=error', () => {
      logger.error('boom');
      expect(stderrSpy).toHaveBeenCalledTimes(1);
      const parsed = parseTskv(stderrSpy.mock.calls[0][0] as string);
      expect(parsed.level).toBe('error');
    });

    it('warn пишет в stdout с level=warn', () => {
      logger.warn('careful');
      const parsed = parseTskv(stdoutSpy.mock.calls[0][0] as string);
      expect(parsed.level).toBe('warn');
    });

    it('debug пишет в stdout с level=debug', () => {
      logger.debug('inspect');
      const parsed = parseTskv(stdoutSpy.mock.calls[0][0] as string);
      expect(parsed.level).toBe('debug');
    });

    it('verbose пишет в stdout с level=verbose', () => {
      logger.verbose('details');
      const parsed = parseTskv(stdoutSpy.mock.calls[0][0] as string);
      expect(parsed.level).toBe('verbose');
    });
  });
});
