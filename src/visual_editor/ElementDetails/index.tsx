import { finder } from "@medv/finder";
import React, { FC, useCallback, useEffect, useState } from "react";
import GripHandle from "../GripHandle";
import DetailsRow from "./DetailsRow";
import ClassNamesEdit from "./ClassNamesEdit";
import AttributeEdit, { Attribute, IGNORED_ATTRS } from "./AttributeEdit";

const ElementDetails: FC<{
  element: HTMLElement;
  clearElement: () => void;
}> = ({ element, clearElement }) => {
  const [x, setX] = useState(24);
  const [y, setY] = useState(24);

  const name = element.tagName;
  const html = element.innerHTML;
  const selector = finder(element, { seedMinLength: 5 });

  const setHTML = useCallback(
    (html: string) => {
      element.innerHTML = html;
    },
    [element]
  );

  const setClassNames = useCallback(
    (classNames: string) => {
      element.className = classNames;
    },
    [element]
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
      removed.forEach((attr) => element.removeAttribute(attr.name));
      changed.forEach((attr) => {
        element.removeAttribute(attr.name);
        element.setAttribute(attr.name, attr.value);
      });
    },
    [element]
  );

  return (
    <div
      className="fixed bg-slate-300 rounded-lg shadow-xl z-max overflow-y-auto"
      style={{
        bottom: `${y}px`,
        left: `${x}px`,
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
        <ClassNamesEdit element={element} onSave={setClassNames} />
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
