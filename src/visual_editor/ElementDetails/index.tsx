import { finder } from "@medv/finder";
import { DeclarativeMutation } from "dom-mutator";
import React, { FC, useCallback, useEffect, useState } from "react";
import GripHandle from "../GripHandle";
import DetailsRow from "./DetailsRow";
import ClassNamesEdit from "./ClassNamesEdit";
import AttributeEdit, { Attribute, IGNORED_ATTRS } from "./AttributeEdit";
import useFixedPositioning from "../lib/hooks/useFixedPositioning";

const ElementDetails: FC<{
  element: HTMLElement;
  clearElement: () => void;
  addMutation: (mutation: DeclarativeMutation) => void;
}> = ({ addMutation, element, clearElement }) => {
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    bottomAligned: true,
  });

  const name = element.tagName;
  const html = element.innerHTML;
  const selector = finder(element, { seedMinLength: 5 });

  const setHTML = useCallback(
    (html: string) => {
      addMutation({
        action: "set",
        attribute: "html",
        value: html,
        selector,
      });
    },
    [element]
  );

  const addClassNames = useCallback(
    (classNames: string) => {
      addMutation({
        action: "append",
        attribute: "class",
        value: classNames,
        selector,
      });
    },
    [element, addMutation]
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

  const setClassNames = useCallback(
    (classNames: string) => {
      addMutation({
        action: "set",
        attribute: "class",
        value: classNames,
        selector,
      });
    },
    [element, addMutation]
  );

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
    <div
      className="bg-slate-300 rounded-lg shadow-xl z-max overflow-y-auto"
      style={{
        ...parentStyles,
        width: "36rem",
        maxHeight: "36rem",
      }}
    >
      <div className="text-right py-2 mr-2">
        <a
          className="text-grey-200 underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            clearElement();
          }}
        >
          close
        </a>
      </div>

      <div className="flex flex-col ml-4">
        <DetailsRow label="Selector" value={selector} readOnly />
        <DetailsRow label="Tag name" value={name} readOnly />
        <DetailsRow label="Inner HTML" value={html} onSave={setHTML} />
        <ClassNamesEdit
          element={element}
          onRemove={removeClassNames}
          onAdd={addClassNames}
        />
        <AttributeEdit element={element} onSave={setAttributes} />
      </div>

      <GripHandle
        reverseY
        className="w-full h-4 bg-slate-300 rounded-b-lg"
        x={x}
        y={y}
        setX={setX}
        setY={setY}
      />
    </div>
  );
};

export default ElementDetails;
