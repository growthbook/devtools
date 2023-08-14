import React, { FC } from "react";
import { ErrorCode, OpenOptionsPageMessage } from "../../devtools";
import { CSPError } from "./lib/hooks/useApi";

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

const ErrorDisplay: FC<{ error: ErrorCode; cspError: CSPError | null }> = ({
  error,
  cspError,
}) => {
  const openOptionsPage = () => {
    const msg: OpenOptionsPageMessage = { type: "GB_OPEN_OPTIONS_PAGE" };
    window.postMessage(msg, window.location.origin);
  };

  switch (error) {
    case "no-api-host":
    case "no-api-key":
      return (
        <div className="gb-p-4 gb-text-red-400">
          GrowthBook API credentials did not reach the Chrome Extension. Please
          set your API host and key in the{" "}
          <a
            className="gb-underline"
            href="#"
            onClick={() => openOptionsPage()}
          >
            Chrome Extension Options page
          </a>
          .
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
          You have reached your daily limit for copying experiments. Please try
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

export default ErrorDisplay;
