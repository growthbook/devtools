import React, { useRef, FC, useEffect } from "react";
import { CSPError } from "../../../devtools";
import { SelectorError } from "../lib/hooks/useSelectorErrors";

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

const SelectorErrorDisplay = ({ selectorError }: { selectorError: SelectorError }) => (
  <div className="m-4 p-4 text-red-400 text-sm bg-red-950/30 border-2 border-red-500/50 rounded-lg">
    <p className="mb-2 font-bold text-base text-red-300">
      CSS Selector Error {selectorError.context ? `in ${selectorError.context}` : ""}
    </p>
    <p className="mb-2">
      <span className="font-semibold">Error:</span> {selectorError.error}
    </p>
    {selectorError.selector && (
      <p className="mb-2">
        <span className="font-semibold">Selector:</span>{" "}
        <code className="bg-gray-800 px-2 py-1 rounded text-xs break-all">
          {selectorError.selector}
        </code>
      </p>
    )}
    <p className="text-xs text-gray-400 mt-3 p-2 bg-gray-900/50 rounded">
      💡 <strong>Tip:</strong> This usually happens when the element selector contains special characters. 
      Try selecting a different element or toggling "Ignore class names" in the element details.
    </p>
  </div>
);

interface ErrorDisplayProps {
  error: string | null;
  cspError: CSPError | null;
  selectorError?: SelectorError | null;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, cspError, selectorError }) => {
  if (selectorError) {
    return <SelectorErrorDisplay selectorError={selectorError} />;
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
  const { error, cspError, selectorError } = props;
  const errorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!error && !cspError && !selectorError && !errorContainerRef.current) return;
    errorContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [error, cspError, selectorError, errorContainerRef.current]);

  return (
    <div ref={errorContainerRef}>
      <ErrorDisplay {...props} />
    </div>
  );
};
