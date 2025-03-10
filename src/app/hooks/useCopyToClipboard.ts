import { useEffect, useState } from "react";
import { getActiveTabId } from "@/app/hooks/useTabState";

type CopyToClipboardOptions = {
  /**
   * Optional delay to flip the success flag back to false. Useful for toggling UI elements.
   * Pass -1 to not flip the success flag back.
   * (default: -1)
   */
  timeout?: number;
};

type UseCopyToClipboard = {
  copySuccess: boolean;
  performCopy: (value: string) => void;
};

export const useCopyToClipboard = ({
  timeout = -1,
}: CopyToClipboardOptions): UseCopyToClipboard => {
  const [success, setSuccess] = useState(false);

  const performCopyToClipboard = async (value: string) => {
    try {
      // popup can copy the text immediately
      await navigator.clipboard.writeText(value);
      setSuccess(true);
    } catch (e) {
      // devtools panel must send a message to embed_script
      const activeTabId = await getActiveTabId();
      if (!activeTabId) {
      }
      if (chrome?.tabs) {
        console.log("send 1", value);
        await chrome.tabs.sendMessage(activeTabId, {
          type: "COPY_TO_CLIPBOARD",
          value,
        });
        setSuccess(true);
      } else {
        console.log("send 2", value);
        await chrome.runtime.sendMessage({ type: "COPY_TO_CLIPBOARD", value });
        setSuccess(true);
      }
    }
  };

  useEffect(
    function flipSuccessAfterDelay() {
      if (timeout === -1) return;

      if (success) {
        const timer = window.setTimeout(() => {
          setSuccess(false);
        }, timeout);

        return () => {
          window.clearTimeout(timer);
        };
      }
    },
    [success, timeout],
  );

  return {
    copySuccess: success,
    performCopy: performCopyToClipboard,
  };
};
