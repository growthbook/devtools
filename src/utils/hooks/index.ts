import { useEffect, useState } from "react";
import {
  loadApiKey,
  saveApiKey,
  clearApiKey,
  saveApiHost,
  loadApiHost,
} from "../storage";

const DEFAULT_API_HOST =
  process.env.NODE_ENV === "production"
    ? "https://api.growthbook.io"
    : "http://localhost:3100";

export const useApiKey = () => {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiHost, setApiHost] = useState<string | null>(DEFAULT_API_HOST);

  const _loadApiKey = async () => {
    setApiKey(await loadApiKey());
  };

  const _loadApiHost = async () => {
    setApiHost(await loadApiHost());
  };

  const _saveApiKey = async (apiKey: string) => {
    setLoading(true);

    await saveApiKey(apiKey);
    setApiKey(apiKey);

    setLoading(false);
  };

  const _saveApiHost = async (apiHost: string) => {
    setLoading(true);

    await saveApiHost(apiHost);
    setApiHost(apiHost);

    setLoading(false);
  };

  const _clearApiKey = async () => {
    setLoading(true);

    await clearApiKey();
    setApiKey(null);

    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([_loadApiKey(), _loadApiHost()]);
      setLoading(false);
    };
    load();
  }, []);

  return {
    apiKey,
    apiHost,
    loading,
    saveApiKey: _saveApiKey,
    saveApiHost: _saveApiHost,
    clearApiKey: _clearApiKey,
  };
};

export const useApiEndpoint = <T>(endpoint: string | null) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);

  const fetchEndpoint = async () => {
    setLoading(true);

    try {
      const apiHost = await loadApiHost();
      const apiKey = await loadApiKey();

      const res = await fetch(`${apiHost}/api/v1/${endpoint}`, {
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
    if (!endpoint) return;
    fetchEndpoint();
  }, [endpoint]);

  return {
    data,
    loading,
    refresh: fetch,
  };
};
