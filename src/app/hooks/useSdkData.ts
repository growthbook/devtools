import useTabState from "@/app/hooks/useTabState";
import type { SDKHealthCheckResult } from "devtools";

export default function useSdkData() {
  const [sdkData] = useTabState<SDKHealthCheckResult>("sdkData", {
    canConnect: false,
    hasPayload: false,
    hasClientKey: false,
    errorMessage: undefined,
    version: undefined,
    sdkFound: false,
    clientKey: undefined,
    isLoading: true, // set to true to show loading state if needed
    payload: undefined,
  });
  return sdkData;
}
