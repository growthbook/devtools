import clsx from "clsx";
import { finder } from "@medv/finder";
import React, { FC, useEffect, useState } from "react";
import { RxPencil1 } from "react-icons/rx";
import DetailsRow from "./DetailsRow";

const ElementDetails: FC<{
  element: HTMLElement;
  clearElement: () => void;
}> = ({ element, clearElement }) => {
  const [x, setX] = useState(24);
  const [y, setY] = useState(24);
  const name = element.tagName;
  const html = element.innerHTML;
  // @ts-expect-error image elements are not typed correctly
  const src = element.src;
  const selector = finder(element, { seedMinLength: 5 });
  return (
    <div
      className="fixed bg-slate-300 rounded rounded-l-lg shadow-xl z-max"
      style={{ bottom: `${y}px`, left: `${x}px`, width: "36rem" }}
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
        <DetailsRow label="HTML" value={html} />
        <DetailsRow label="Source" value={src} />
      </div>
    </div>
  );
};

export default ElementDetails;
