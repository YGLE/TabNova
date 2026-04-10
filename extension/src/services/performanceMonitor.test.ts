import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { measureAsync, measureRender, createTrackedDebounce } from './performanceMonitor';

describe('performanceMonitor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('measureAsync', () => {
    it('returns the function result', async () => {
      const result = await measureAsync('test-op', async () => 42);
      expect(result).toBe(42);
    });

    it('returns complex object results unchanged', async () => {
      const payload = { id: 'abc', value: [1, 2, 3] };
      const result = await measureAsync('obj-op', async () => payload);
      expect(result).toStrictEqual(payload);
    });

    it('logs a warning for slow operations (> 200ms)', async () => {
      // Simulate slow operation by mocking performance.now
      let callCount = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount += 1;
        return callCount === 1 ? 0 : 300; // 300ms elapsed
      });

      await measureAsync('slow-op', async () => 'done');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation "slow-op"')
      );
    });

    it('does not log a warning for fast operations (< 200ms)', async () => {
      vi.spyOn(performance, 'now').mockReturnValue(0);

      await measureAsync('fast-op', async () => 'done');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('rethrows errors from the wrapped function', async () => {
      const boom = new Error('boom');
      await expect(
        measureAsync('failing-op', async () => {
          throw boom;
        })
      ).rejects.toThrow('boom');
    });

    it('logs an error message when the operation fails', async () => {
      await expect(
        measureAsync('err-op', async () => {
          throw new Error('fail');
        })
      ).rejects.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed operation "err-op"')
      );
    });
  });

  describe('measureRender', () => {
    it('returns a function', () => {
      const stop = measureRender('MyComponent');
      expect(typeof stop).toBe('function');
    });

    it('logs a warning when render takes more than 16ms', () => {
      let callCount = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount += 1;
        return callCount === 1 ? 0 : 20; // 20ms render
      });

      const stop = measureRender('SlowComponent');
      stop();

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow render "SlowComponent"')
      );
    });

    it('does not log a warning for fast renders (<= 16ms)', () => {
      vi.spyOn(performance, 'now').mockReturnValue(0);

      const stop = measureRender('FastComponent');
      stop();

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('createTrackedDebounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('debounces calls — only fires after the delay', () => {
      const fn = vi.fn();
      const debounced = createTrackedDebounce(fn, 100, 'debounce-test');

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('resets the timer on each call', () => {
      const fn = vi.fn();
      const debounced = createTrackedDebounce(fn, 200, 'reset-test');

      debounced();
      vi.advanceTimersByTime(100);
      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments through to the wrapped function', () => {
      const fn = vi.fn<[string, number], void>();
      const debounced = createTrackedDebounce(
        fn as unknown as (...args: unknown[]) => void,
        50,
        'args-test'
      );

      debounced('hello', 42);
      vi.advanceTimersByTime(50);

      expect(fn).toHaveBeenCalledWith('hello', 42);
    });

    it('logs a warning when the debounced call is slow (> 50ms)', () => {
      vi.useRealTimers();
      vi.useFakeTimers();

      let perfCallCount = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        perfCallCount += 1;
        // start=0, end=60 → 60ms > 50ms threshold
        return perfCallCount % 2 === 1 ? 0 : 60;
      });

      const fn = vi.fn();
      const debounced = createTrackedDebounce(fn, 10, 'slow-debounce');
      debounced();
      vi.advanceTimersByTime(10);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow debounced call "slow-debounce"')
      );
    });
  });
});
