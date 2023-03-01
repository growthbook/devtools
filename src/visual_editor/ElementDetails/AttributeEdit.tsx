import { validAttributeName } from "dom-mutator";
import React, { FC, useCallback, useState } from "react";
import { RxCross2, RxPlus, RxCheck } from "react-icons/rx";
import {
  highlightedAttributeName,
  selectedAttributeName,
} from "../lib/selectionMode";

export const IGNORED_ATTRS = [
  "class",
  highlightedAttributeName,
  selectedAttributeName,
];

const isValidAttrName = (attrName: string) => {
  if (IGNORED_ATTRS.includes(attrName)) return false;
  if (!validAttributeName.test(attrName)) return false;
  return true;
};

export interface Attribute {
  name: string;
  value: string;
}

const normalizeAttrs = (attrs: NamedNodeMap) =>
  [...attrs]
    .map(({ name, value }) => ({ name, value }))
    .filter((attr) => isValidAttrName(attr.name));

const EditAttributeInput: FC<{
  name?: string;
  value?: string;
  onSubmit: ({ name, value }: Attribute) => void;
  onCancel: () => void;
}> = ({
  name: _name = "",
  value: _value = "",
  onSubmit: _onSubmit,
  onCancel: _onCancel,
}) => {
  const [name, setName] = useState(_name);
  const [value, setValue] = useState(_value);
  const onCancel = useCallback(() => {
    setName("");
    setValue("");
    _onCancel();
  }, [setName, setValue]);
  const onSubmit = useCallback(() => {
    _onSubmit({ name, value });
    onCancel();
  }, [name, value, _onSubmit, onCancel]);
  return (
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

      <div className="flex-1 bg-indigo-700 text-white py-1 px-2 m-1 rounded cursor-pointer">
        <input
          type="text"
          className="rounded py-0 px-2 text-sm text-black"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div>
        <button className="text-green-700" onClick={onSubmit}>
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
  );
};

const AddAttributeInput: FC<{
  onAdd: (attr: Attribute) => void;
}> = ({ onAdd: _onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const onCancel = useCallback(() => {
    setIsAdding(false);
  }, [setIsAdding]);
  const onAdd = useCallback(
    ({ name, value }: Attribute) => {
      if (isValidAttrName(name)) {
        _onAdd({ name, value });
      }
      onCancel();
    },
    [_onAdd, onCancel]
  );
  return (
    <>
      {isAdding ? (
        <EditAttributeInput onSubmit={onAdd} onCancel={onCancel} />
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

const AttributeToken: FC<
  Attribute & {
    onRemove: () => void;
    onEdit: (attr: Attribute) => void;
  }
> = ({ name, value, onRemove, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const onCancel = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);
  const onSubmit = useCallback(
    (attr: Attribute) => {
      onEdit(attr);
      onCancel();
    },
    [onEdit, onCancel]
  );
  if (isEditing) {
    return (
      <EditAttributeInput
        name={name}
        value={value}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }
  return (
    <div className="flex items-center rounded bg-slate-200 text-sm pl-2 mr-2 my-1">
      <div className="mr-1 font-semibold">
        {name}
        {value ? ":" : null}
      </div>

      {value ? (
        <button
          className="flex-1 bg-indigo-700 text-white px-2 m-1 rounded cursor-pointer break-all text-left"
          onClick={() => setIsEditing(true)}
        >
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
};

const AttributeEdit: FC<{
  element: HTMLElement;
  onSave: (attributes: Attribute[]) => void;
}> = ({ element, onSave }) => {
  const attributes = normalizeAttrs(element.attributes);

  const removeAttr = useCallback(
    (name: string) => {
      onSave(attributes.filter((attr) => attr.name !== name));
    },
    [attributes, onSave]
  );

  const addAttr = useCallback(
    ({ name, value }: Attribute) => {
      const deduped = attributes.filter((a) => a.name !== name);
      onSave([...deduped, { name, value }]);
    },
    [onSave, attributes]
  );

  const editAttr = useCallback(
    ({ name, value }: Attribute) => {
      onSave([
        ...attributes.map((a) => (a.name === name ? { name, value } : a)),
      ]);
    },
    [onSave, attributes]
  );

  return (
    <div className="flex mb-2 items-start mr-2 -ml-2 p-2 rounded-lg bg-slate-400">
      <div className="w-24 text-white">HTML Attributes</div>

      <div className="flex-1 flex flex-wrap ml-4 items-center">
        {attributes.map(({ name, value }, index) => (
          <AttributeToken
            key={index}
            name={name}
            value={value}
            onEdit={editAttr}
            onRemove={() => removeAttr(name)}
          />
        ))}
        <AddAttributeInput onAdd={addAttr} />
      </div>
    </div>
  );
};

export default AttributeEdit;
