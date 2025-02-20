import { LogUnion } from "@growthbook/growthbook";
import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";
import LogsList from "./LogsList";
import { Link } from "@radix-ui/themes";
import { MW } from "@/app";
import { useResponsiveContext } from "../hooks/useResponsive";

export default function LogsTab() {
  const { isResponsive, isTiny } = useResponsiveContext();

  const [currentTab, setCurrentTab] = useTabState("currentTab", "logs");
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
        height: "100%",
      }}
    >
      {typeof logEvents === "undefined" ? (
        <div className="flex w-full h-10 items-end justify-center">
          <div>
            SDK logging not connected. See the{" "}
            <Link
              role="button"
              href="#"
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab("sdkDebug");
              }}
            >
              SDK Health
            </Link>{" "}
            tab.
          </div>
        </div>
      ) : (
        <LogsList
          logEvents={logEvents}
          isResponsive={isResponsive}
          isTiny={isTiny}
        />
      )}
    </div>
  );
}
