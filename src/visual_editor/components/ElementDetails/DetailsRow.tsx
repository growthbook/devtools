import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { RxCheck, RxCross2, RxReset } from "react-icons/rx";
import TextareaAutosize from "react-textarea-autosize";

const DetailsRow = ({
  label,
  value = "",
  readOnly = false,
  onSave = () => {},
  onUndo,
}:
  | {
      label: string;
      value: string;
      readOnly: true;
      onSave?: never;
      onUndo?: never;
    }
  | {
      label: string;
      value: string;
      readOnly?: false;
      onSave: (value: string) => void;
      onUndo?: () => void;
    }) => {
  const [editing, setIsEditing] = useState(false);
  const [_value, _setValue] = useState<string>(value);

  useEffect(() => {
    _setValue(value);
  }, [value]);

  const cancelEdit = () => {
    _setValue(value);
    setIsEditing(false);
  };

  const saveEdit = () => {
    onSave(_value);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx("flex", {
        "flex-col": editing,
      })}
    >
      <div className="w-24 text-xs text-slate-400">{label}</div>

      {editing ? (
        <div className="w-full pr-2">
          <TextareaAutosize
            className="w-full mt-2 text-sm p-1"
            onChange={(e) => _setValue(e.currentTarget.value)}
            value={_value}
          />
          <div className="flex justify-end my-1">
            <button onClick={saveEdit}>
              <RxCheck className="w-4 h-4 mr-2 cursor-pointer" />
            </button>
            <button onClick={cancelEdit}>
              <RxCross2 className="w-4 h-4 cursor-pointer" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "text-slate-200 text-ellipsis overflow-hidden text-sm",
            {
              "hover:text-slate-100": !readOnly,
              "hover:bg-slate-600": !readOnly,
              "cursor-pointer": !readOnly,
            },
          )}
          style={{ flex: 2, maxHeight: "3rem" }}
          onClick={!readOnly ? () => setIsEditing(true) : () => {}}
        >
          {_value}
        </div>
      )}
      {onUndo && (
        <div className="px-1">
          <button onClick={onUndo}>
            <RxReset className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailsRow;
