import React, { useRef, FC, useEffect } from "react";
import { CSPError } from "../../../devtools";

const CSPErrorDisplay = ({ cspError }: { cspError: CSPError | null }) => (
  <div className="p-4 text-red-400">
    The {cspError ? `${cspError.violatedDirective} directive in the` : ""}{" "}
    Content Security Policy on this page is too strict for the Visual Editor.
    Refer to the Visual Editor documentation's{" "}
    <a
      className="underline"
      href="https://docs.growthbook.io/app/visual#security-requirements"
      target="_blank"
      rel="noreferrer"
    >
      'Security Requirements'
    </a>{" "}
    for details.
  </div>
);

interface ErrorDisplayProps {
  error: string | null;
  cspError: CSPError | null;
}
const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, cspError }) => {
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

  // scroll to error
  useEffect(() => {
    if (!error && !cspError && !errorContainerRef.current) return;
    errorContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [error, cspError, errorContainerRef.current]);

  return (
    <div ref={errorContainerRef}>
      <ErrorDisplay {...props} />
    </div>
  );
};
