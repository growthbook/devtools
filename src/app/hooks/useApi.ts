import { useCallback } from "react";
import useSWR from "swr";
import useApiKey from "./useApiKey";

export async function apiCall(
  apiHost: string | null,
  apiKey: string | null,
  url: string | null,
  options: Omit<RequestInit, "headers"> = {}
) {
  if (!apiHost || !apiKey || typeof url !== "string") return;
  const init: RequestInit = { ...options };
  init.headers = {};
  init.headers["Authorization"] = `Bearer ${apiKey}`;
  init.credentials = "include";
  if (init.body && !init.headers["Content-Type"]) {
    init.headers["Content-Type"] = "application/json";
  }
  const response = await fetch(apiHost + url, init);
  const responseData = await response.json();

  if (responseData.status && responseData.status >= 400) {
    throw new Error(responseData.message || "There was an error");
  }

  return responseData;
}

type CurriedApiCallType<T> = (url: string, options?: RequestInit) => Promise<T>;

export default function useApi<Response = unknown>(
  path: string,
  allowInvalidApiKey = false
) {
  const { apiHost, apiKey, apiKeyValid } = useApiKey();
  const curriedApiCall: CurriedApiCallType<Response> = useCallback(
    async (url: string | null, options: Omit<RequestInit, "headers"> = {}) => {
      if (!apiKeyValid && !allowInvalidApiKey) return;
      return await apiCall(apiHost, apiKey, url, options);
    },
    [apiHost, apiKey, allowInvalidApiKey, apiKeyValid]
  );

  return useSWR<Response, Error>(
    `${path}_${apiHost}_${apiKey}_${apiKeyValid}_${allowInvalidApiKey}`,
    async () => curriedApiCall(path, { method: "GET" })
  );
}
