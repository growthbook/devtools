import React, { FC, useCallback, useState } from "react";
import { RxPlus, RxCheck, RxCross2 } from "react-icons/rx";

const AddClassNameInput: FC<{ onAdd: (className: string) => void }> = ({
  onAdd,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const onSave = useCallback(() => {
    onAdd(newClassName);
    setNewClassName("");
    setIsAdding(false);
  }, [onAdd, newClassName, setNewClassName]);
  const onCancel = useCallback(() => {
    setIsAdding(false);
    setNewClassName("");
  }, [setIsAdding, setNewClassName]);
  return (
    <div className="flex-1 flex">
      {isAdding ? (
        <div>
          <input
            type="text"
            className="rounded px-2 text-sm"
            placeholder="Enter class name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
        </div>
      ) : null}

      <div className="flex justify-center items-center h-5">
        {isAdding ? (
          <div className="ml-2">
            <button className="text-slate-200" onClick={onSave}>
              <RxCheck className="w-4 h-4" />
            </button>
            <button className="text-slate-200 ml-1" onClick={onCancel}>
              <RxCross2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button className="text-slate-200" onClick={() => setIsAdding(true)}>
            <RxPlus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const ClassNameToken: FC<{
  className: string;
  onRemove: () => void;
}> = ({ className, onRemove }) => {
  return (
    <div className="flex justify-between rounded bg-slate-600 text-slate-200 text-sm px-2 mr-2 mb-1">
      {className}
      <button
        className="text-slate-200 hover:text-slate-100 ml-1"
        onClick={onRemove}
      >
        <RxCross2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const ClassNamesEdit: FC<{
  element: HTMLElement;
  onRemove: (classNames: string) => void;
  onAdd: (classNames: string) => void;
}> = ({ element, onRemove, onAdd: _onAdd }) => {
  const classNames = element.className.split(" ").filter(Boolean);

  const onAdd = useCallback(
    (classNames: string) => {
      const newClassNames = new Set([...classNames.split(" ")]);
      _onAdd(Array.from(newClassNames).join(" "));
    },
    [classNames, _onAdd]
  );

  return (
    <div className="flex flex-wrap items-center ml-4">
      {classNames.map((className, index) => (
        <ClassNameToken
          key={index}
          className={className}
          onRemove={() => onRemove(className)}
        />
      ))}
      <AddClassNameInput onAdd={onAdd} />
    </div>
  );
};

export default ClassNamesEdit;
