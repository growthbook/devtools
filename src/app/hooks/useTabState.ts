import { useState, useEffect } from "react";

type UseStateReturn<T> = [T, (value: T) => void, boolean];

export async function getActiveTabId() {
  try {
    // @ts-ignore Firefox
    if (browser?.devtools?.inspectedWindow?.tabId) {
      // @ts-ignore Firefox
      return browser.devtools.inspectedWindow.tabId;
    }
  } catch (e) {
    // ignore
  }

  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs?.length) {
    const window = await chrome.windows.getLastFocused();
    const windowId = window?.id || -1;
    tabs = await chrome.tabs.query({ active: true, windowId });
  }
  const activeTab = tabs[0];
  return activeTab?.id;
}

export default function useTabState<T>(
  property: string,
  defaultValue: T,
): UseStateReturn<T> {
  const [state, setState] = useState(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!property) {
      setState(defaultValue);
      setReady(false);
      return;
    }
    // Fetch (query) state from content script when the component mounts (or when the property changes)
    // note: Content script state is pushed via "tabStateChanged" message
    const fetchState = async () => {
      const activeTabId = await getActiveTabId();
      if (!activeTabId) return;
      try {
        if (chrome?.tabs) {
          await chrome.tabs.sendMessage(activeTabId, {
            type: "getTabState",
            property,
          });
        } else {
          await chrome.runtime.sendMessage({
            type: "getTabState",
            property,
          });
        }
      } catch (error) {
        console.error("Error fetching state from content script", error);
      }
    };
    fetchState();

    // Listener for content script state changes
    const listener = async (message: any, sender: any) => {
      if (!property) return;
      const activeTabId = await getActiveTabId();
      const senderTabId = sender?.tab?.id ?? message?.tabId;
      const shouldListen =
        activeTabId && senderTabId ? activeTabId === senderTabId : false;
      if (
        shouldListen &&
        message.type === "tabStateChanged" &&
        message.property === property
      ) {
        // Missing value indicates no state found in tab store, keep default value
        if ("value" in message) {
          setState(message.value);
        }
        setReady(true);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [property]);

  // Setter for state: updates state in the content script
  const setTabState = async (value: T) => {
    if (!property) return;
    setState(value); // Optimistic update
    const activeTabId = await getActiveTabId();
    if (!activeTabId) return;
    try {
      if (chrome?.tabs) {
        await chrome.tabs.sendMessage(activeTabId, {
          type: "setTabState",
          property,
          value,
        });
      } else {
        await chrome.runtime.sendMessage({
          type: "setTabState",
          property,
          value,
        });
      }
    } catch (error) {
      console.error("Error setting tab state in content script", error);
    }
  };

  return [state, setTabState, ready];
}
