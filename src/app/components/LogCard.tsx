import { LogUnion } from "@growthbook/growthbook";
import React from "react";

export default function LogCard({ logEvent }: { logEvent: LogUnion }) {
  const { logType, timestamp, ...rest } = logEvent;

  return (
    <div className="bg-slate-4 -mt-0.5 px-1 py-0.5 rounded-full mr-2 flex-shrink-0">
      {JSON.stringify(rest)}
    </div>
  );
}
