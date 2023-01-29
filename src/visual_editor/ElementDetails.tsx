import { InputElementProps } from "@chakra-ui/react";
import clsx from "clsx";
import React, { FC, useState } from "react";
import { RxPencil1 } from "react-icons/rx";

const DetailsRow = ({
  label,
  value = "",
  inputType = "text",
  readOnly = true,
}: {
  label: string;
  value: string;
  inputType?: HTMLInputElement["type"];
  readOnly?: boolean;
}) => {
  const [editing, setIsEditing] = useState(false);
  const [_value, _setValue] = useState<string>(value);
  return (
    <label className="flex mb-2 items-center">
      <div style={{ flex: 1 }}>{label}</div>
      <input
        style={{ flex: 2 }}
        className={clsx("ml-4 p-2 rounded", {
          "bg-white": editing,
          "bg-slate-200": !editing,
        })}
        type={inputType}
        readOnly={readOnly}
        value={_value}
        onChange={(e) => _setValue(e.target.value)}
      />
      <div className="flex-1 flex justify-center">
        {!readOnly ? (
          <button onClick={() => setIsEditing(true)}>
            <RxPencil1 />
          </button>
        ) : null}
      </div>
    </label>
  );
};

const ElementDetails: FC<{
  element: HTMLElement;
  clearElement: () => void;
}> = ({ element, clearElement }) => {
  const [x, setX] = useState(24);
  const [y, setY] = useState(24);
  const name = element.tagName;
  const html = element.innerHTML;
  return (
    <div
      className="fixed bg-slate-300 rounded rounded-l-lg shadow-xl z-max px-4"
      style={{ bottom: `${y}px`, left: `${x}px` }}
    >
      <div className="text-right py-2">
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

      <div className="flex flex-col">
        <DetailsRow label="Tag name" value={name} />
        <DetailsRow label="HTML" value={html} readOnly={false} />
      </div>
    </div>
  );
};

export default ElementDetails;
