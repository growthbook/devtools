import { useEffect, useState } from "react";
import { loadApiKey, saveApiKey, clearApiKey } from "../storage";

export default () => {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const _loadApiKey = async () => {
    setApiKey(await loadApiKey());
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
    const load = async () => {
      setLoading(true);
      await _loadApiKey();
      setLoading(false);
    };
    load();
  }, []);

  return {
    apiKey,
    loading,
    saveApiKey: _saveApiKey,
    clearApiKey: _clearApiKey,
  };
};
