import clsx from "clsx";
import React, { FC, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { RxCheck, RxCross2 } from "react-icons/rx";

const CSSTextInput: FC<{
  icon: IconType;
  name: string;
  value: string;
  isInline: boolean;
  updateAttribute: (name: string, value: string) => void;
}> = ({ name, value: _value, isInline, updateAttribute }) => {
  const [editing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>(_value);

  const saveEdit = () => {
    updateAttribute(name, value);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setValue(_value);
    setIsEditing(false);
  };

  useEffect(() => {
    setValue(_value);
  }, [_value]);

  return (
    <label
      className={clsx("flex mb-2 last:mb-0", {
        "flex-col": editing,
      })}
    >
      <div className="w-24 text-xs text-slate-400">{name}</div>

      {editing ? (
        <div className="w-full pr-2">
          <input
            type="text"
            className="w-full mt-2 text-sm p-1"
            onChange={(e) => setValue(e.currentTarget.value)}
            value={value}
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
            "text-ellipsis",
            "overflow-hidden",
            "text-sm",
            "hover:text-slate-100",
            "hover:bg-slate-600",
            "cursor-pointer",
            {
              "text-slate-200": isInline,
              "text-slate-400": !isInline,
            },
          )}
          style={{ flex: 2, maxHeight: "3rem" }}
          onClick={() => setIsEditing(true)}
        >
          {value}
        </div>
      )}
    </label>
  );
};

export default CSSTextInput;
