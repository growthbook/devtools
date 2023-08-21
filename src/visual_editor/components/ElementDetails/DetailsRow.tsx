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
      className={clsx("gb-flex gb-mb-2 last:gb-mb-0", {
        "flex-col": editing,
      })}
    >
      <div className="gb-w-24 gb-text-xs gb-text-slate-400">{label}</div>

      {editing ? (
        <div className="gb-w-full gb-pr-2">
          <TextareaAutosize
            className="gb-text-black gb-w-full gb-mt-2 gb-text-sm gb-p-1"
            onChange={(e) => _setValue(e.currentTarget.value)}
            value={_value}
          />
          <div className="gb-flex gb-justify-end gb-my-1">
            <button onClick={saveEdit}>
              <RxCheck className="gb-w-4 gb-h-4 gb-mr-2 gb-cursor-pointer" />
            </button>
            <button onClick={cancelEdit}>
              <RxCross2 className="gb-w-4 gb-h-4 gb-cursor-pointer" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "gb-text-slate-200 gb-text-ellipsis gb-overflow-hidden gb-text-sm",
            {
              "hover:gb-text-slate-100": !readOnly,
              "hover:gb-bg-slate-600": !readOnly,
              "gb-cursor-pointer": !readOnly,
            }
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
