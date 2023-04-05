import { DeclarativeMutation } from "dom-mutator";
import React, { FC, useCallback } from "react";
import DetailsRow from "./DetailsRow";

const ElementDetails: FC<{
  selector: string;
  element: HTMLElement;
  addMutation: (mutation: DeclarativeMutation) => void;
  addMutations: (mutations: DeclarativeMutation[]) => void;
}> = ({ addMutation, element, selector }) => {
  const name = element.tagName;
  const html = element.innerHTML;
  const isHtmlTooLarge = html.length > 100000;

  const setHTML = useCallback(
    (html: string) => {
      addMutation({
        action: "set",
        attribute: "html",
        value: html,
        selector,
      });
    },
    [element, addMutation]
  );

  return (
    <div className="text-light flex flex-col ml-4">
      <DetailsRow label="Selector" value={selector} readOnly />
      <DetailsRow label="Tag name" value={name} readOnly />
      {isHtmlTooLarge ? (
        <DetailsRow
          readOnly
          label="Inner HTML"
          value={"HTML is too large to display"}
        />
      ) : (
        <DetailsRow label="Inner HTML" value={html} onSave={setHTML} />
      )}
    </div>
  );
};

export default ElementDetails;
