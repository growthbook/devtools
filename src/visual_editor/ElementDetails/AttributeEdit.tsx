import clsx from "clsx";
import { validAttributeName } from "dom-mutator";
import React, { FC, useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { RxCross2, RxPlus, RxCheck } from "react-icons/rx";
import { highlightedAttributeName, selectedAttributeName } from "../lib/modes";

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
  const isAdding = !_name;
  const [name, setName] = useState(_name);
  const [value, setValue] = useState(_value);
  const onCancel = useCallback(() => {
    setName("");
    setValue("");
    _onCancel();
  }, [setName, setValue]);
  const onSubmit = useCallback(() => {
    _onSubmit({ name, value: value.trim() });
    onCancel();
  }, [name, value, _onSubmit, onCancel]);
  return (
    <>
      {isAdding ? (
        <input
          type="text"
          className="px-2 text-sm w-16 mb-2"
          placeholder="Key"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      ) : (
        <div className="w-12 text-xs text-slate-400 mb-2">{name}</div>
      )}

      <TextareaAutosize
        className="py-0 px-2 text-sm text-black mr-2 mb-1"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div>
        <button className="text-slate-200" onClick={onSubmit}>
          <RxCheck className="w-4 h-4" />
        </button>
        <button className="text-slate-200 mx-1" onClick={onCancel}>
          <RxCross2 className="w-4 h-4" />
        </button>
      </div>
    </>
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
        <button className="text-slate-200" onClick={() => setIsAdding(true)}>
          <RxPlus className="w-4 h-4" />
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
    <div className="flex mb-2 last:mb-0">
      <div className="w-12 text-xs text-slate-400">{name}</div>

      <div
        className={clsx(
          "text-link text-ellipsis overflow-hidden text-sm hover:bg-slate-600"
        )}
        style={{ flex: 2, maxHeight: "3rem" }}
        onClick={() => setIsEditing(true)}
      >
        {value}
      </div>

      <button className="text-link mx-1" onClick={onRemove}>
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
    <div className="flex flex-col ml-4">
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
  );
};

export default AttributeEdit;
