import { useEffect, useState } from "react";
import {
  loadApiHost,
  saveApiHost,
  loadApiKey,
  saveApiKey,
  clearApiKey,
} from "../storage";

export default () => {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiHost, setApiHost] = useState<string | null>(null);

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
    apiHost,
    apiKey,
    loading,
    saveApiHost: _saveApiHost,
    saveApiKey: _saveApiKey,
    clearApiKey: _clearApiKey,
  };
};
