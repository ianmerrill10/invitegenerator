import {
  debounce,
  throttle,
  memoize,
  lazy,
  preloadImage,
} from "@/lib/performance";

// Mock timers
jest.useFakeTimers();

describe("Performance Utilities", () => {
  describe("debounce", () => {
    it("should delay function execution", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on subsequent calls", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      jest.advanceTimersByTime(50);
      debouncedFunc();
      jest.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to the debounced function", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc("arg1", "arg2");
      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("throttle", () => {
    it("should execute immediately on first call", () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it("should throttle subsequent calls", () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      throttledFunc();
      throttledFunc();

      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(2); // Last queued call executes
    });

    it("should pass arguments to the throttled function", () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc("arg1");
      expect(func).toHaveBeenCalledWith("arg1");
    });
  });

  describe("memoize", () => {
    it("should cache function results", () => {
      const func = jest.fn((x: number) => x * 2);
      const memoizedFunc = memoize(func);

      expect(memoizedFunc(5)).toBe(10);
      expect(memoizedFunc(5)).toBe(10);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it("should use different cache keys for different arguments", () => {
      const func = jest.fn((x: number) => x * 2);
      const memoizedFunc = memoize(func);

      expect(memoizedFunc(5)).toBe(10);
      expect(memoizedFunc(10)).toBe(20);
      expect(func).toHaveBeenCalledTimes(2);
    });

    it("should support custom resolver", () => {
      const func = jest.fn((obj: { id: number }) => obj.id * 2);
      const memoizedFunc = memoize(func, (obj) => obj.id.toString());

      expect(memoizedFunc({ id: 5 })).toBe(10);
      expect(memoizedFunc({ id: 5 })).toBe(10);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe("lazy", () => {
    it("should lazily initialize value", () => {
      const initializer = jest.fn(() => "initialized");
      const getValue = lazy(initializer);

      expect(initializer).not.toHaveBeenCalled();

      const value1 = getValue();
      expect(value1).toBe("initialized");
      expect(initializer).toHaveBeenCalledTimes(1);

      const value2 = getValue();
      expect(value2).toBe("initialized");
      expect(initializer).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe("preloadImage", () => {
    beforeEach(() => {
      // Reset real timers for image loading test
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it("should resolve with image element on success", async () => {
      // Create a mock image
      const mockImage = {
        onload: null as ((event: Event) => void) | null,
        onerror: null as ((event: Event) => void) | null,
        src: "",
      };

      const originalImage = global.Image;
      global.Image = jest.fn(() => mockImage as unknown as HTMLImageElement) as unknown as typeof Image;

      const promise = preloadImage("test.jpg");

      // Trigger onload
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload(new Event("load"));
        }
      }, 0);

      const result = await promise;
      expect(result).toBe(mockImage);

      global.Image = originalImage;
    });

    it("should reject on error", async () => {
      const mockImage = {
        onload: null as ((event: Event) => void) | null,
        onerror: null as ((event: Event) => void) | null,
        src: "",
      };

      const originalImage = global.Image;
      global.Image = jest.fn(() => mockImage as unknown as HTMLImageElement) as unknown as typeof Image;

      const promise = preloadImage("invalid.jpg");

      // Trigger onerror
      setTimeout(() => {
        if (mockImage.onerror) {
          mockImage.onerror(new Event("error"));
        }
      }, 0);

      await expect(promise).rejects.toBeDefined();

      global.Image = originalImage;
    });
  });
});
