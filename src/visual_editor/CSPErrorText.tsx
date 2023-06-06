import React, { FC } from "react";
import { CSPError } from "./lib/hooks/useApi";

const CSPErrorText: FC<{ cspError: CSPError }> = ({ cspError }) =>
  cspError ? (
    <div className="gb-p-4 gb-text-red-400">
      The '{cspError.violatedDirective}' directive in the Content Security
      Policy on this page is too strict for the Visual Editor. Refer to the
      Visual Editor documentation's{" "}
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
  ) : null;

export default CSPErrorText;
