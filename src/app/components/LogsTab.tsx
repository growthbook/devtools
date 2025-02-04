import { LogUnion } from "@growthbook/growthbook";
import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";

export default function LogsTab() {
  useEffect(() => window.scrollTo({ top: 0 }), []);
  const [logEvents] = useTabState<LogUnion[]>("logEvents", []);
  const [devModeEnabled] = useTabState<boolean>("devModeEnabled", false);

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="label lg mb-2">Event Logs</div>
      <div className="box mb-3"></div>
      {logEvents.length === 0 ? (
        <>No log events found! TODO: add debug info for why</>
      ) : (
        <div>
          {logEvents.map((evt, i) => {
            return <div key={i}>{JSON.stringify(evt)}</div>;
          })}
        </div>
      )}
    </div>
  );
}
