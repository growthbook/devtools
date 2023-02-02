import React, { FC, useCallback, useEffect, useState } from "react";
import { RxPlus, RxTrash, RxCheck, RxCross2 } from "react-icons/rx";

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
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
        </div>
      ) : null}

      <div className="flex justify-center items-center h-5">
        {isAdding ? (
          <div className="ml-2">
            <button className="text-green-700" onClick={onSave}>
              <RxCheck className="w-4 h-4" strokeWidth={2} />
            </button>
            <button className="text-rose-600 ml-1" onClick={onCancel}>
              <RxCross2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <button className="text-indigo-900" onClick={() => setIsAdding(true)}>
            <RxPlus className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
};

const ClassNameToken: FC<{
  key: number;
  className: string;
  onRemove: () => void;
}> = ({ key, className, onRemove }) => {
  return (
    <div key={key} className="flex rounded bg-slate-200 text-sm px-2 mr-2 mb-2">
      {className}
      <button className="text-red-700 ml-1" onClick={onRemove}>
        <RxCross2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const ClassNamesEdit: FC<{
  element: HTMLElement;
  setClassNames: (classNames: string) => void;
}> = ({ element, setClassNames }) => {
  const [classNames, _setClassNames] = useState<string[]>(
    element.className.split(" ").filter(Boolean)
  );

  useEffect(() => {
    _setClassNames(element.className.split(" ").filter(Boolean));
  }, [element]);

  const removeClassName = (className: string) => {
    const newClassNames = classNames.filter((c) => c !== className);
    _setClassNames(newClassNames);
    setClassNames(newClassNames.join(" "));
  };

  const onAdd = (newClassName: string) => {
    const newClassNames = new Set([...classNames, ...newClassName.split(" ")]);
    _setClassNames([...newClassNames]);
    setClassNames([...newClassNames].join(" "));
  };

  return (
    <div className="flex mb-2 items-start mr-2 -ml-2 p-2 rounded-lg bg-slate-400">
      <div className="w-24 text-white">Class names</div>

      <div className="flex-1 flex flex-wrap ml-4">
        {classNames.map((className, index) => (
          <ClassNameToken
            key={index}
            className={className}
            onRemove={() => removeClassName(className)}
          />
        ))}
        <AddClassNameInput onAdd={onAdd} />
      </div>
    </div>
  );
};

export default ClassNamesEdit;
