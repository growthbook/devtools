import { DeclarativeMutation } from "dom-mutator";
import React, { FC, useCallback } from "react";
import DetailsRow from "./DetailsRow";

const ElementDetails: FC<{
  selector: string;
  element: HTMLElement;
  setElement: (element: HTMLElement) => void;
  addMutation: (mutation: DeclarativeMutation) => void;
  addMutations: (mutations: DeclarativeMutation[]) => void;
}> = ({ addMutation, element, selector }) => {
  const name = element.tagName;
  const html = element.innerHTML;

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
    <div className="text-slate-300 flex flex-col ml-4">
      <DetailsRow label="Selector" value={selector} readOnly />
      <DetailsRow label="Tag name" value={name} readOnly />
      <DetailsRow label="Inner HTML" value={html} onSave={setHTML} />
    </div>
  );
};

export default ElementDetails;
