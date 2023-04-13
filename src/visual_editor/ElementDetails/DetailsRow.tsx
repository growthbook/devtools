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
        <RxPencil1 className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      <button className="text-green-500 hover:text-green-700" onClick={onSave}>
        <RxCheck className="w-6 h-6" />
      </button>
      <button className="text-rose-500 hover:text-rose-700" onClick={onCancel}>
        <RxCross2 className="w-6 h-6" />
      </button>
    </>
  );
};

const DetailsRow = ({
  label,
  value = "",
  readOnly = false,
  onSave = () => {},
  onErase,
}:
  | {
      label: string;
      value: string;
      readOnly: true;
      onSave?: never;
      onErase?: never;
    }
  | {
      label: string;
      value: string;
      readOnly?: false;
      onSave: (value: string) => void;
      onErase?: () => void;
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
      className={clsx("flex mb-2 last:mb-0", {
        "flex-col": editing,
      })}
    >
      <div className="w-24 text-xs text-slate-400">{label}</div>

      {editing ? (
        <div className="w-full pr-2">
          <TextareaAutosize
            className="text-black w-full mt-2 text-sm p-1"
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
            }
          )}
          style={{ flex: 2, maxHeight: "3rem" }}
          onClick={!readOnly ? () => setIsEditing(true) : () => {}}
        >
          {_value}
        </div>
      )}
      {onErase && (
        <div className="px-1">
          <button onClick={onErase}>
            <RxCross2 className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      )}
    </label>
  );
};

export default DetailsRow;
