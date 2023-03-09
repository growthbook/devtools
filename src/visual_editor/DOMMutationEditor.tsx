import { DeclarativeMutation } from "dom-mutator";
import React, { FC, useState } from "react";

const DOMMutationEditor: FC<{
  addMutation: (mutation: DeclarativeMutation) => void;
}> = ({ addMutation }) => {
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
    <div className="bg-slate-300 rounded-lg shadow-xl z-max w-96">
      <div className="p-4">
        <div className="text-xl font-semibold mb-2">Add DOM Mutation</div>

        <div className="flex w-full items-center mb-2">
          <div className="text-gray-700 w-20">Selector</div>
          <input
            className="p-2"
            type="text"
            value={selector}
            onChange={(e) => setSelector(e.currentTarget.value)}
          />
        </div>

        <div className="flex w-full items-center mb-2">
          <div className="text-gray-700 w-20">Action</div>
          <select
            className="p-2"
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

        <div className="flex w-full items-center mb-2">
          <div className="text-gray-700 w-20">Attribute</div>
          <input
            type="text"
            className="p-2"
            value={attribute}
            onChange={(e) => setAttribute(e.currentTarget.value)}
          />
        </div>

        <div className="flex w-full items-center mb-4">
          <div className="text-gray-700 w-20">Value</div>
          <input
            type="text"
            className="p-2"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            className="p-4 bg-indigo-800 text-white font-semibold rounded-lg w-24"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DOMMutationEditor;
