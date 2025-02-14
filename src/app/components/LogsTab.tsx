import { LogUnion } from "@growthbook/growthbook";
import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";
import LogsList from "./LogsList";
import { Link } from "@radix-ui/themes";
import { MW } from "@/app";

export default function LogsTab() {
  const [_showSdkDebug, setShowSdkDebug] = useTabState("showSdkDebug", false);

  useEffect(() => window.scrollTo({ top: 0 }), []);
  const [logEvents] = useTabState<LogUnion[] | undefined>(
    "logEvents",
    undefined,
  );

  return (
    <div
      className="mx-auto"
      style={{
        maxWidth: MW,
        overflowX: "hidden",
      }}
    >
      {typeof logEvents === "undefined" ? (
        <>
          SDK logging not connected, see the{" "}
          <Link
            className="cursor-pointer"
            onClick={() => {
              setShowSdkDebug(true);
            }}
          >
            SDK Health
          </Link>{" "}
          tab
        </>
      ) : (
        <LogsList logEvents={logEvents}></LogsList>
      )}
    </div>
  );
}
