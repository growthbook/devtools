import React, { FC, useCallback, useEffect, useState } from "react";
import { RxCross2, RxPlus, RxCheck } from "react-icons/rx";
import {
  highlightedAttributeName,
  selectedAttributeName,
} from "../lib/selectionMode";

const IGNORED_ATTRS = [
  "class",
  highlightedAttributeName,
  selectedAttributeName,
];

const normalizeAttrs = (attrs: NamedNodeMap) =>
  [...attrs]
    .map(({ name, value }) => ({ name, value }))
    .filter((attr) => !IGNORED_ATTRS.includes(attr.name));

const AddAttributeInput: FC<{
  onAdd: (attr: { name: string; value: string }) => void;
}> = ({ onAdd: _onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const onCancel = useCallback(() => {
    setIsAdding(false);
    setName("");
    setValue("");
  }, [setIsAdding, setName, setValue]);
  const onAdd = useCallback(() => {
    _onAdd({ name, value });
    onCancel();
  }, [name, value, _onAdd]);
  return (
    <>
      {isAdding ? (
        <div className="flex items-center rounded bg-slate-200 text-sm pl-2 mr-2 my-1">
          <div className="mr-1 font-semibold">
            <input
              type="text"
              className="rounded px-2 text-sm w-16"
              placeholder="Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex-1 bg-indigo-700 text-white py-1 px-2 m-1 rounded transition-transform hover:scale-105 cursor-pointer">
            <input
              type="text"
              className="rounded py-0 px-2 text-sm text-black"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div>
            <button className="text-green-700" onClick={onAdd}>
              <RxCheck className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              className="text-rose-500 hover:text-rose-700 ml-1"
              onClick={onCancel}
            >
              <RxCross2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <button
          className="text-indigo-900 h-7"
          onClick={() => setIsAdding(true)}
        >
          <RxPlus className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </>
  );
};

const AttributeToken: FC<{
  name: string;
  value: string;
  onRemove: () => void;
}> = ({ name, value, onRemove }) => (
  <div className="flex items-center rounded bg-slate-200 text-sm pl-2 mr-2 my-1">
    <div className="mr-1 font-semibold">
      {name}
      {value ? ":" : null}
    </div>

    {value ? (
      <button className="flex-1 bg-indigo-700 text-white px-2 m-1 rounded cursor-pointer break-all text-left">
        {value}
      </button>
    ) : null}

    <button
      className="text-rose-500 hover:text-rose-700 mx-1"
      onClick={onRemove}
    >
      <RxCross2 className="w-4 h-4" />
    </button>
  </div>
);

const AttributeEdit: FC<{
  element: HTMLElement;
  onSave: (attributes: Record<string, string>[]) => void;
}> = ({ element, onSave: _onSave }) => {
  const [attributes, setAttributes] = useState<Record<string, string>[]>(
    normalizeAttrs(element.attributes)
  );

  const onSave = useCallback(
    (newAttrs: Record<string, string>[]) => {
      setAttributes(newAttrs);
      _onSave(newAttrs);
    },
    [setAttributes, _onSave]
  );

  const removeAttr = useCallback(
    (name: string) => {
      onSave(attributes.filter((attr) => attr.name !== name));
    },
    [attributes, onSave]
  );

  const addAttr = useCallback(
    ({ name, value }: { name: string; value: string }) => {
      onSave([...attributes, { name, value }]);
    },
    [onSave, attributes]
  );

  useEffect(() => {
    setAttributes(normalizeAttrs(element.attributes));
  }, [element]);

  return (
    <div className="flex mb-2 items-start mr-2 -ml-2 p-2 rounded-lg bg-slate-400">
      <div className="w-24 text-white">HTML Attributes</div>

      <div className="flex-1 flex flex-wrap ml-4 items-center">
        {attributes.map(({ name, value }, index) => (
          <>
            <AttributeToken
              key={index}
              name={name}
              value={value}
              onRemove={() => removeAttr(name)}
            />
          </>
        ))}
        <AddAttributeInput onAdd={addAttr} />
      </div>
    </div>
  );
};

export default AttributeEdit;
