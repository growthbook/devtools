import React, { FC } from "react";
import DetailsRow from "./DetailsRow";

const ElementDetails: FC<{
  selector: string;
  element: HTMLElement;
  setHTML: (html: string) => void;
  undoHTMLMutations?: () => void;
  ignoreClassNames: boolean;
  setIgnoreClassNames: (value: boolean) => void;
}> = ({
  element,
  selector,
  setHTML,
  undoHTMLMutations,
  ignoreClassNames,
  setIgnoreClassNames,
}) => {
  const name = element.tagName;
  const html = element.innerHTML;
  const isHtmlTooLarge = html.length > 100000;

  return (
    <div className="text-light flex flex-col ml-4">
      <div className="mb-2">
        <DetailsRow label="Selector" value={selector} readOnly />
        <label className="text-xs flex items-center my-1">
          <input
            className="mr-2"
            type="checkbox"
            checked={ignoreClassNames}
            onChange={(e) => setIgnoreClassNames(e.target.checked)}
          />
          Ignore class names
        </label>
      </div>

      <div className="mb-2">
        <DetailsRow label="Tag name" value={name} readOnly />
      </div>
      <div className="mb-2">
        {isHtmlTooLarge ? (
          <DetailsRow
            readOnly
            label="Inner HTML"
            value={"HTML is too large to display"}
          />
        ) : (
          <DetailsRow
            label="Inner HTML"
            value={html}
            onSave={setHTML}
            onUndo={undoHTMLMutations}
          />
        )}
      </div>
    </div>
  );
};

export default ElementDetails;
