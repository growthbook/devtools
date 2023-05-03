import { DeclarativeMutation } from "dom-mutator";
import React, { FC, useCallback, useMemo } from "react";
import DetailsRow from "./DetailsRow";

const ElementDetails: FC<{
  selector: string;
  element: HTMLElement;
  addMutation: (mutation: DeclarativeMutation) => void;
  addMutations: (mutations: DeclarativeMutation[]) => void;
  mutations: DeclarativeMutation[];
  removeDomMutations: (mutations: DeclarativeMutation[]) => void;
}> = ({ addMutation, element, selector, mutations, removeDomMutations }) => {
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

  const undoHTMLMutations = useMemo(() => {
    const htmlMutations = mutations.filter(
      (mutation) =>
        mutation.attribute === "html" && mutation.selector === selector
    );
    if (htmlMutations.length === 0) return;
    return () => {
      removeDomMutations(htmlMutations);
    };
  }, [mutations, selector]);

  return (
    <div className="gb-text-light gb-flex gb-flex-col gb-ml-4">
      <DetailsRow label="Selector" value={selector} readOnly />
      <DetailsRow label="Tag name" value={name} readOnly />
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
  );
};

export default ElementDetails;
