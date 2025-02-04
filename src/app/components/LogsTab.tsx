import { LogUnion } from "@growthbook/growthbook";
import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";
import LogsList from "./LogsList";

export default function LogsTab() {
  useEffect(() => window.scrollTo({ top: 0 }), []);
  const [logEvents] = useTabState<LogUnion[] | undefined>(
    "logEvents",
    undefined
  );

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="label lg mb-2">Event Logs</div>
      {typeof logEvents === "undefined" ? (
        <>Logging not connected! TODO: add debug info for why</>
      ) : (
        <LogsList logEvents={logEvents}></LogsList>
      )}
    </div>
  );
}
