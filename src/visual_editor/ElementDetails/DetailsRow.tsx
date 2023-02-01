import clsx from "clsx";
import React, { FC, useEffect, useState } from "react";
import { RxPencil1, RxCheck, RxCross2 } from "react-icons/rx";

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
      <button className="text-lime-600" onClick={onSave}>
        <RxCheck className="w-6 h-6" />
      </button>
      <button className="text-rose-600" onClick={onCancel}>
        <RxCross2 className="w-6 h-6" />
      </button>
    </>
  );
};

const DetailsRow = ({
  label,
  value = "",
  inputType = "text",
  readOnly = false,
  onSave = () => {},
}:
  | {
      label: string;
      value: string;
      inputType?: HTMLInputElement["type"];
      readOnly: true;
      onSave?: never;
    }
  | {
      label: string;
      value: string;
      inputType?: HTMLInputElement["type"];
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
    <label className="flex mb-2 items-center">
      <div className="w-24">{label}</div>
      <input
        style={{ flex: 2 }}
        className={clsx("ml-4 p-2 rounded", {
          "bg-white": editing,
          "bg-slate-200": !editing,
        })}
        type={inputType}
        readOnly={readOnly || !editing}
        value={_value}
        onChange={(e) => _setValue(e.target.value)}
      />
      <div className="flex justify-center w-16">
        {!readOnly ? (
          <EditAndSaveButtons
            isEditing={editing}
            toggleEditing={() => setIsEditing(!editing)}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        ) : null}
      </div>
    </label>
  );
};

export default DetailsRow;
