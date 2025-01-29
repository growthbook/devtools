import { useCallback, useEffect, useState } from "react";
import useSWR, { SWRConfiguration } from "swr";
import useApiKey from "./useApiKey";

type ApiCallType<T> = (url: string, options?: RequestInit) => Promise<T>;

export default function useApi<Response = unknown>(path: string) {
  const { apiHost, apiKey } = useApiKey();
  const apiCall: ApiCallType<Response> = useCallback(
    async (url: string | null, options: Omit<RequestInit, "headers"> = {}) => {
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
    },
    [apiHost, apiKey]
  );

  return useSWR<Response, Error>(path, async () =>
    apiCall(path, { method: "GET" })
  );
}
