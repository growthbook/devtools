import React, { FC } from "react";
import DetailsRow from "./DetailsRow";

export const isHtmlTooLarge = (html: string) => html.length > 100000;

const ElementDetails: FC<{
  selector: string;
  element: HTMLElement;
  setHTML: (html: string) => void;
  undoHTMLMutations?: () => void;
}> = ({ element, selector, setHTML, undoHTMLMutations }) => {
  const name = element.tagName;
  const html = element.innerHTML;

  return (
    <div className="gb-text-light gb-flex gb-flex-col gb-ml-4">
      <DetailsRow label="Selector" value={selector} readOnly />
      <DetailsRow label="Tag name" value={name} readOnly />
      {isHtmlTooLarge(html) ? (
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
  );
};

export default ElementDetails;
