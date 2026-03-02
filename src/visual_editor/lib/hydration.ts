type HydrationWaitOptions = {
  quietWindowMs?: number;
  maxWaitMs?: number;
};

const DEFAULT_QUIET_MS = 300;
const DEFAULT_MAX_WAIT_MS = 5000;

export const waitForHydrationSafe = ({
  quietWindowMs = DEFAULT_QUIET_MS,
  maxWaitMs = DEFAULT_MAX_WAIT_MS,
}: HydrationWaitOptions = {}): Promise<void> => {
  return new Promise((resolve) => {
    const finish = () => resolve();

    const waitForLoad = (onLoaded: () => void) => {
      if (document.readyState === "complete") {
        onLoaded();
        return;
      }

      const onLoad = () => {
        window.removeEventListener("load", onLoad);
        onLoaded();
      };
      window.addEventListener("load", onLoad, { once: true });
    };

    waitForLoad(() => {
      let quietTimer: number | null = null;
      let maxTimer: number | null = null;
      let observer: MutationObserver | null = null;
      let done = false;

      const cleanup = () => {
        if (done) return;
        done = true;
        if (quietTimer) window.clearTimeout(quietTimer);
        if (maxTimer) window.clearTimeout(maxTimer);
        observer?.disconnect();
      };

      const resolveOnce = () => {
        cleanup();
        finish();
      };

      const scheduleQuiet = () => {
        if (quietTimer) window.clearTimeout(quietTimer);
        quietTimer = window.setTimeout(resolveOnce, quietWindowMs);
      };

      maxTimer = window.setTimeout(resolveOnce, maxWaitMs);

      try {
        observer = new MutationObserver(() => scheduleQuiet());
        observer.observe(document.documentElement, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      } catch (e) {
        resolveOnce();
        return;
      }

      scheduleQuiet();
    });
  });
};

