import React, { useRef, FC, useEffect } from "react";
import { CSPError } from "../../../devtools";

const CSPErrorDisplay = ({ cspError }: { cspError: CSPError | null }) => (
  <div className={cspError?.isFatal ? "p-4 text-red-400" : "p-4 text-amber-300"}>
    <p className="mb-2">
      {cspError?.isFatal ? "Critical CSP restriction" : "CSP warning"}:{" "}
      {cspError
        ? `${cspError.effectiveDirective || cspError.violatedDirective}`
        : "Unknown directive"}
      .
    </p>
    {!cspError?.isFatal ? (
      <p className="text-sm">
        Some site scripts were blocked by CSP. Visual Editor should stay active.
      </p>
    ) : (
      <p className="text-sm">
        Extension resources required by Visual Editor were blocked.
      </p>
    )}
    <p className="text-xs mt-2 break-all">
      Blocked URI: {cspError?.blockedURI || "unknown"}
    </p>
    <p className="text-xs mt-1 break-all">
      Source: {cspError?.sourceFile || "unknown"}
    </p>
    <p className="text-xs mt-2">
      Refer to{" "}
      <a
        className="underline"
        href="https://docs.growthbook.io/app/visual#security-requirements"
        target="_blank"
        rel="noreferrer"
      >
        Visual Editor Security Requirements
      </a>
      .
    </p>
  </div>
);

interface ErrorDisplayProps {
  error: string | null;
  cspError: CSPError | null;
}
const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, cspError }) => {
  if (cspError && !cspError.isFatal && error !== "csp-error") {
    return <CSPErrorDisplay cspError={cspError} />;
  }

  switch (error) {
    case "no-api-host":
    case "no-api-key":
      return (
        <div className="p-4 text-red-400 text-sm">
          <p className="mb-2">
            GrowthBook API credentials did not reach the Chrome Extension.
          </p>
          <p>
            Please set your API host and key in the DevTools extension settings
            and reload the page.
          </p>
        </div>
      );
    case "csp-error":
      return <CSPErrorDisplay cspError={cspError} />;
    default:
      return (
        <div className="p-4 text-red-400">
          An unknown error occurred. Please try again or contact support with
          the error code: '{error}'.
        </div>
      );
  }
};

export default (props: ErrorDisplayProps) => {
  const { error, cspError } = props;
  const errorContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScroll = !!error || !!cspError?.isFatal;

  // scroll to error
  useEffect(() => {
    if (!shouldAutoScroll) return;
    errorContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [shouldAutoScroll]);

  return (
    <div ref={errorContainerRef}>
      <ErrorDisplay {...props} />
    </div>
  );
};
