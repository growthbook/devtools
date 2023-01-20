import { useEffect, useState } from "react";
import { loadApiKey, saveApiKey, clearApiKey } from "../../storage";

const API_HOST =
  process.env.NODE_ENV === "production"
    ? "https://api.growthbook.io"
    : "http://localhost:3100";

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

  const _clearApiKey = async () => {
    setLoading(true);

    await clearApiKey();
    setApiKey(null);

    setLoading(false);
  };

  useEffect(() => {
    _loadApiKey();
  }, []);

  return {
    apiKey,
    loading,
    saveApiKey: _saveApiKey,
    clearApiKey: _clearApiKey,
  };
};

export const useApiEndpoint = <T>(endpoint: string, apiKey: string) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);

  const fetchEndpoint = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_HOST}/api/v1/${endpoint}`, {
        headers: {
          Authorization: `Basic ${btoa(apiKey + ":")}`,
        },
      });

      const json = await res.json();

      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoint();
  }, []);

  return {
    data,
    loading,
    refresh: fetch,
  };
};
