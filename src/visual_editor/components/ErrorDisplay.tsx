import React, { useRef, FC, useEffect } from "react";
import { CSPError, ErrorCode, OpenOptionsPageMessage } from "../../../devtools";

const CSPErrorDisplay = ({ cspError }: { cspError: CSPError | null }) => (
  <div className="gb-p-4 gb-text-red-400">
    The {cspError ? `${cspError.violatedDirective} directive in the` : ""}{" "}
    Content Security Policy on this page is too strict for the Visual Editor.
    Refer to the Visual Editor documentation's{" "}
    <a
      className="gb-underline"
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
  error: ErrorCode;
  cspError: CSPError | null;
}
const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, cspError }) => {
  const openOptionsPage = () => {
    const msg: OpenOptionsPageMessage = { type: "GB_OPEN_OPTIONS_PAGE" };
    window.postMessage(msg, window.location.origin);
  };

  switch (error) {
    case "no-api-host":
    case "no-api-key":
      return (
        <div className="gb-p-4 gb-text-red-400 gb-text-sm">
          <p className="gb-mb-2">
            GrowthBook API credentials did not reach the Chrome Extension.
          </p>
          <p>
            Please set your API host and key in the{" "}
            <a
              className="gb-underline gb-cursor-pointer"
              onClick={() => openOptionsPage()}
            >
              Chrome Extension Options
            </a>{" "}
            and reload the page.
          </p>
        </div>
      );
    case "csp-error":
      return <CSPErrorDisplay cspError={cspError} />;
    case "load-viz-changeset-failed":
      return (
        <div className="gb-p-4 gb-text-red-400">
          Failed to load the visual experiment from the server. Please try
          again, or contact support with the error code: '{error}'.
        </div>
      );
    case "update-viz-changeset-failed":
      return (
        <div className="gb-p-4 gb-text-red-400">
          Failed to save updates to the visual experiment. Please try again, or
          contact support with the error code: '{error}'.
        </div>
      );
    case "transform-copy-failed":
      return (
        <div className="gb-p-4 gb-text-red-400">
          Something went wrong while trying to generate copy. Please try again,
          or contact support with the error code: '{error}'.
        </div>
      );
    case "transform-copy-daily-limit-reached":
      return (
        <div className="gb-p-4 gb-text-red-400">
          You have reached your daily limit for generating copy. Please try
          again tomorrow.
        </div>
      );
    default:
      return (
        <div className="gb-p-4 gb-text-red-400">
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
