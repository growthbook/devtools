import getSelector from "../lib/getSelector";
import { DeclarativeMutation } from "dom-mutator";
import React, { FC, useCallback, useMemo } from "react";
import DetailsRow from "./DetailsRow";
import ClassNamesEdit from "./ClassNamesEdit";
import AttributeEdit, { Attribute, IGNORED_ATTRS } from "./AttributeEdit";

const ElementDetails: FC<{
  selector: string;
  element: HTMLElement;
  setElement: (element: HTMLElement) => void;
  addMutation: (mutation: DeclarativeMutation) => void;
  addMutations: (mutations: DeclarativeMutation[]) => void;
}> = ({ addMutation, addMutations, element, selector }) => {
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

  const addClassNames = useCallback(
    (classNames: string) => {
      addMutations(
        classNames.split(" ").map((className) => ({
          action: "append",
          attribute: "class",
          value: className,
          selector,
        }))
      );
    },
    [element, addMutations]
  );

  const removeClassNames = useCallback(
    (classNames: string) => {
      addMutation({
        action: "remove",
        attribute: "class",
        value: classNames,
        selector,
      });
    },
    [element, addMutation]
  );

  // TODO Change to add/remove only
  const setAttributes = useCallback(
    (attrs: Attribute[]) => {
      const existing = [...element.attributes];
      const removed = existing.filter(
        (e) =>
          !attrs.find((a) => a.name === e.name) &&
          !IGNORED_ATTRS.includes(e.name)
      );
      const changed = attrs.filter(
        (attr) => attr.value !== element.getAttribute(attr.name)
      );
      removed.forEach((attr) => {
        addMutation({
          action: "remove",
          attribute: attr.name,
          selector,
          value: attr.value,
        });
      });
      changed.forEach((attr) => {
        addMutation({
          action: element.hasAttribute(attr.name) ? "set" : "append",
          attribute: attr.name,
          selector,
          value: attr.value,
        });
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
