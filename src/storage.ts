import { useEffect, useState } from "react";

const NAMESPACE = "gb-devtools";
const VERSION = "v1";
const API_KEY = `${NAMESPACE}-${VERSION}-api-key`;

export const loadApiKey = async () => {
  const result = await chrome.storage.sync.get([API_KEY]);
  return result[API_KEY] || null;
};

export const saveApiKey = (apiKey: string) =>
  chrome.storage.sync.set({ [API_KEY]: apiKey });

export const useApiKey = () => {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const _loadApiKey = async () => {
    setLoading(true);

    setApiKey(await loadApiKey());

    setLoading(false);
  };

  const _saveApiKey = async (apiKey: string) => {
    setLoading(true);

    await saveApiKey(apiKey);
    setApiKey(apiKey);

    setLoading(false);
  };

  useEffect(() => {
    _loadApiKey();
  }, []);

  return {
    apiKey,
    loading,
    saveApiKey: _saveApiKey,
  };
};
