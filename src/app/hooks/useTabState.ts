import { useState, useEffect } from "react";

type UseStateReturn<T> = [T, (value: T) => void, boolean];

export default function useTabState<T>(
  property: string,
  defaultValue: T
): UseStateReturn<T> {
  const [state, setState] = useState(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Fetch state when the component mounts (or when the property changes)
    const fetchState = async () => {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];
      if (activeTab?.id) {
        try {
          const response = await chrome.tabs.sendMessage(activeTab.id, {
            type: "getState",
            property,
          });
          if (response) {
            // Missing state indicates no state found in global store, keep default value
            if ("state" in response) {
              setState(response.state);
            }
            if (!ready) setReady(true);
          }
        } catch (error) {
          console.error("Error fetching state from content script", error);
        }
      }
    };
    fetchState();

    // Listener for content script state changes
    const listener = (message: any) => {
      if (message.type === "tabStateChanged" && message.property === property) {
        // Missing value indicates no state found in global store, keep default value
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
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab?.id) {
      try {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: "setState",
          property,
          value,
        });
        setState(value);
      } catch (error) {
        console.error("Error setting state in content script", error);
      }
    }
  };

  return [state, setTabState, ready];
}
