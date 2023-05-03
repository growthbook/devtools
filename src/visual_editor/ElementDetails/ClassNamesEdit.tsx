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
    <div className="gb-flex-1 gb-flex">
      {isAdding ? (
        <div>
          <input
            type="text"
            className="gb-rounded gb-px-2 gb-text-sm"
            placeholder="Enter class name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
        </div>
      ) : null}

      <div className="gb-flex gb-justify-center gb-items-center gb-h-5">
        {isAdding ? (
          <div className="gb-ml-2">
            <button className="gb-text-slate-200" onClick={onSave}>
              <RxCheck className="gb-w-4 gb-h-4" />
            </button>
            <button className="gb-text-slate-200 gb-ml-1" onClick={onCancel}>
              <RxCross2 className="gb-w-4 gb-h-4" />
            </button>
          </div>
        ) : (
          <button
            className="gb-text-slate-200"
            onClick={() => setIsAdding(true)}
          >
            <RxPlus className="gb-w-4 gb-h-4" />
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
    <div className="gb-flex gb-justify-between gb-rounded gb-bg-slate-600 gb-text-slate-200 gb-text-sm gb-px-2 gb-mr-2 gb-mb-1">
      {className}
      <button className="gb-text-link gb-ml-1" onClick={onRemove}>
        <RxCross2 className="gb-w-4 gb-h-4" />
      </button>
    </div>
  );
};

const ClassNamesEdit: FC<{
  element: HTMLElement;
  onRemove: (classNames: string) => void;
  onAdd: (classNames: string) => void;
}> = ({ element, onRemove, onAdd: _onAdd }) => {
  const classNameString = element.getAttribute("class") || "";
  const classNames = classNameString.split(" ").filter(Boolean);

  const onAdd = useCallback(
    (classNames: string) => {
      const newClassNames = new Set([...classNames.split(" ")]);
      _onAdd(Array.from(newClassNames).join(" "));
    },
    [classNames, _onAdd]
  );

  return (
    <div className="gb-flex gb-flex-wrap gb-items-center gb-ml-4">
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
