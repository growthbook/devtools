import clsx from "clsx";
import React, { FC, useEffect, useState } from "react";
import { RxPencil1, RxCheck, RxCross2 } from "react-icons/rx";
import TextareaAutosize from "react-textarea-autosize";

const EditAndSaveButtons = ({
  isEditing,
  toggleEditing,
  onSave,
  onCancel,
}: {
  isEditing: boolean;
  toggleEditing: () => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  if (!isEditing) {
    return (
      <button onClick={toggleEditing}>
        <RxPencil1 className="gb-w-6 gb-h-6" />
      </button>
    );
  }

  return (
    <>
      <button className="gb-text-green-500 hover:gb-text-green-700" onClick={onSave}>
        <RxCheck className="w-6 h-6" />
      </button>
      <button className="gb-text-rose-500 hover:gb-text-rose-700" onClick={onCancel}>
        <RxCross2 className="gb-w-6 gb-h-6" />
      </button>
    </>
  );
};

const DetailsRow = ({
  label,
  value = "",
  readOnly = false,
  onSave = () => {},
}:
  | {
      label: string;
      value: string;
      readOnly: true;
      onSave?: never;
    }
  | {
      label: string;
      value: string;
      readOnly?: false;
      onSave: (value: string) => void;
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
    <label
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
    </label>
  );
};

export default DetailsRow;
