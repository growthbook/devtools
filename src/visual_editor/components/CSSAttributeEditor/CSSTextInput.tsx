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
      className={clsx("gb-flex gb-mb-2 last:gb-mb-0", {
        "flex-col": editing,
      })}
    >
      <div className="gb-w-24 gb-text-xs gb-text-slate-400">{name}</div>

      {editing ? (
        <div className="gb-w-full gb-pr-2">
          <input
            type="text"
            className="gb-w-full gb-mt-2 gb-text-sm gb-p-1"
            onChange={(e) => setValue(e.currentTarget.value)}
            value={value}
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
            "gb-text-ellipsis",
            "gb-overflow-hidden",
            "gb-text-sm",
            "hover:gb-text-slate-100",
            "hover:gb-bg-slate-600",
            "gb-cursor-pointer",
            {
              "gb-text-slate-200": isInline,
              "gb-text-slate-400": !isInline,
            }
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
