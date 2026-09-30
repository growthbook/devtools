import { useMemo } from "react";
import useSWR from "swr";
import useApiKey from "@/app/hooks/useApiKey";
import { apiCall } from "@/app/hooks/useApi";

type ListExperimentsResponse = {
  experiments: { trackingKey: string; type?: string }[];
  hasMore?: boolean;
  nextOffset?: number | null;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

// Multi-armed bandits look like ordinary experiments in the SDK payload, so
// only the REST API can tell them apart. Servers that predate the bandits
// filter reject it, which leaves this set empty.
export default function useBanditKeys(): Set<string> {
  const { apiHost, apiKey, apiKeyValid } = useApiKey();
  const { data } = useSWR(
    apiHost && apiKey && apiKeyValid ? `banditKeys_${apiHost}_${apiKey}` : null,
    async () => {
      const keys: string[] = [];
      let offset = 0;
      // Results are oldest first, so a single page drops the newest bandits
      for (let page = 0; page < MAX_PAGES; page++) {
        const res: ListExperimentsResponse | undefined = await apiCall(
          apiHost,
          apiKey,
          `/api/v1/experiments?bandits=true&limit=${PAGE_SIZE}&offset=${offset}`,
        );
        for (const e of res?.experiments ?? []) {
          if (e.type === "multi-armed-bandit") keys.push(e.trackingKey);
        }
        if (!res?.hasMore || res.nextOffset == null) break;
        offset = res.nextOffset;
      }
      return keys;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      refreshInterval: 10 * 60_000,
    },
  );
  return useMemo(() => new Set(data ?? []), [data]);
}

export function banditLabel(
  isContextualBandit: boolean | undefined,
  isBandit: boolean,
): string | undefined {
  if (isContextualBandit) return "Contextual Bandit";
  if (isBandit) return "Bandit";
  return undefined;
}
