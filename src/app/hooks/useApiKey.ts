import { useCallback, useEffect, useState } from "react";
import {
  loadApiHost,
  saveApiHost,
  loadApiKey,
  saveApiKey,
  clearApiKey,
} from "@/app/storage";
import { apiCall } from "./useApi";
import useSdkData from "./useSdkData";
import useGlobalState from "./useGlobalState";

export default () => {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiHost, setApiHost] = useState<string | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | undefined>(
    undefined
  );
  const [_organization, setOrganization] = useGlobalState<string | undefined>(
    "orgId",
    undefined,
    true
  );

  const { clientKey } = useSdkData();

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

  const validateApiKey = useCallback(async () => {
    if (!clientKey || !apiHost || !apiKey) {
      setApiKeyValid(false);
      return;
    }
    try {
      const response = await apiCall(
        apiHost,
        apiKey,
        `/api/v1/sdk-connections/lookup/${clientKey}`
      );
      if (response?.sdkConnection?.organization) {
        setOrganization(response.sdkConnection.organization);
        setApiKeyValid(true);
      } else {
        setApiKeyValid(false);
      }
    } catch {
      setApiKeyValid(false);
    }
  }, [clientKey, apiHost, apiKey, apiCall]);

  useEffect(() => {
    validateApiKey();
  }, [clientKey, apiHost, apiKey, apiCall]);

  return {
    apiHost,
    apiKey,
    loading,
    apiKeyValid,
    saveApiHost: _saveApiHost,
    saveApiKey: _saveApiKey,
    clearApiKey: _clearApiKey,
  };
};
