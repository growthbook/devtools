import useTabState from "@/app/hooks/useTabState";
import type { SDKHealthCheckResult } from "devtools";

export default function useSdkData() {
  const [sdkData] = useTabState<SDKHealthCheckResult>("sdkData", {
    canConnect: false,
    hasPayload: false,
    devModeEnabled: false,
    isLoading: true, // set to true to show loading state if needed
  });
  return sdkData;
}
