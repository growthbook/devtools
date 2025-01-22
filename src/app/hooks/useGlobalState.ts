import { useState, useEffect } from "react";

export default function useGlobalState(property: string, defaultValue: any = null, persist: boolean = false) {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    // Fetch state when the component mounts (or when the property changes)
    const fetchState = async () => {
      try {
        await chrome.runtime.sendMessage({ type: "getState", property, persist });
      } catch (error) {
        console.error("Error fetching global state from background worker", error);
      }
    };
    fetchState();

    // Listener for background state changes
    const listener = (message: any) => {
      if (message.type === "globalStateChanged" && message.property === property) {
        setState(message.value);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [property]);

  // Setter for state: updates state in the background worker
  const setGlobalState = async (value: any) => {
    try {
      await chrome.runtime.sendMessage({ type: "setState", property, value, persist });
      setState(value); // Optimistic update
    } catch (error) {
      console.error("Error setting global state in background worker", error);
    }
  };

  return [state, setGlobalState];
}
