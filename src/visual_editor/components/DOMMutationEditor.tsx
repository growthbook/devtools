import { DeclarativeMutation } from "dom-mutator";
import React, { FC, useState } from "react";

const DOMMutationEditor: FC<{
  addMutation: (mutation: DeclarativeMutation) => void;
  onClose?: () => void;
}> = ({ addMutation, onClose }) => {
  const [selector, setSelector] = useState<DeclarativeMutation["selector"]>("");
  const [action, setAction] = useState<DeclarativeMutation["action"]>("append");
  const [attribute, setAttribute] =
    useState<DeclarativeMutation["attribute"]>("");
  const [value, setValue] = useState<DeclarativeMutation["value"]>("");
  const reset = () => {
    setSelector("");
    setAction("append");
    setAttribute("");
    setValue("");
  };

  const save = () => {
    if (!attribute || !selector || typeof value === "undefined") return;

    addMutation({
      action,
      attribute,
      selector,
      value,
    });

    reset();
  };

  return (
    <>
      <div className="gb-flex gb-w-full gb-items-center gb-mb-2">
        <div className="gb-text-slate-200 gb-w-20">Selector</div>
        <input
          className="gb-p-2"
          type="text"
          value={selector}
          onChange={(e) => setSelector(e.currentTarget.value)}
        />
      </div>

      <div className="gb-flex gb-w-full gb-items-center gb-mb-2">
        <div className="gb-text-slate-200 gb-w-20">Action</div>
        <select
          className="gb-p-2"
          value={action}
          onChange={(e) =>
            setAction(e.currentTarget.value as DeclarativeMutation["action"])
          }
        >
          <option value="append">Append</option>
          <option value="set">Set</option>
          <option value="remove">Remove</option>
        </select>
      </div>

      <div className="gb-flex gb-w-full gb-items-center gb-mb-2">
        <div className="gb-text-slate-200 gb-w-20">Attribute</div>
        <input
          type="text"
          className="gb-p-2"
          value={attribute}
          onChange={(e) => setAttribute(e.currentTarget.value)}
        />
      </div>

      <div className="gb-flex gb-w-full gb-items-center gb-mb-4">
        <div className="gb-text-slate-200 gb-w-20">Value</div>
        <input
          type="text"
          className="gb-p-2"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      </div>

      <div className="gb-flex gb-justify-end">
        {onClose && (
          <button className="gb-text-link" onClick={onClose}>
            Cancel
          </button>
        )}
        <button
          className="gb-py-2 gb-px-4 gb-bg-indigo-800 gb-text-link gb-font-semibold gb-rounded gb-ml-2"
          onClick={save}
        >
          Add
        </button>
      </div>
    </>
  );
};

export default DOMMutationEditor;
