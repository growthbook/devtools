import { useState, useEffect } from "react";

type UseStateReturn<T> = [T, (value: T) => void];

export default function useTabState<T>(
  property: string,
  defaultValue: T
): UseStateReturn<T> {
  const [state, setState] = useState(defaultValue);

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
          if (response && "state" in response) {
            setState(response.state);
          }
        } catch (error) {
          console.error("Error fetching state from content script", error);
        }
      }
    };
    fetchState();
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

  return [state, setTabState];
}
