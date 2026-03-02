import { waitForHydrationSafe } from "./hydration";

class MockMutationObserver {
  callback: MutationCallback;
  constructor(callback: MutationCallback) {
    this.callback = callback;
  }
  observe() {
    // no-op
  }
  disconnect() {
    // no-op
  }
}

type ListenerMap = Record<string, Array<() => void>>;

describe("waitForHydrationSafe", () => {
  const listeners: ListenerMap = {};
  let readyState = "loading";

  beforeEach(() => {
    jest.useFakeTimers();
    readyState = "loading";

    const mockWindow = {
      setTimeout,
      clearTimeout,
      addEventListener: (event: string, cb: () => void) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
      },
      removeEventListener: (event: string, cb: () => void) => {
        listeners[event] = (listeners[event] || []).filter((fn) => fn !== cb);
      },
    };
    const mockDocument = {
      get readyState() {
        return readyState;
      },
      documentElement: {},
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = mockWindow;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).document = mockDocument;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).MutationObserver = MockMutationObserver;
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.keys(listeners).forEach((k) => delete listeners[k]);
  });

  it("waits until load event when document is still loading", async () => {
    const promise = waitForHydrationSafe({
      quietWindowMs: 30,
      maxWaitMs: 200,
    });

    readyState = "complete";
    (listeners.load || []).forEach((cb) => cb());
    jest.advanceTimersByTime(35);

    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves after quiet window when page is already complete", async () => {
    readyState = "complete";
    const promise = waitForHydrationSafe({
      quietWindowMs: 20,
      maxWaitMs: 200,
    });

    jest.advanceTimersByTime(25);
    await expect(promise).resolves.toBeUndefined();
  });
});

