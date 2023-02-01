import React, { FC, useEffect, useState } from "react";
import { RxPlus, RxTrash, RxCheck } from "react-icons/rx";

const ClassNamesEdit: FC<{
  element: HTMLElement;
  setClassNames: (classNames: string) => void;
}> = ({ element, setClassNames }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [classNames, _setClassNames] = useState<string[]>(
    element.className.split(" ").filter(Boolean)
  );
  const [newClassName, setNewClassName] = useState("");

  useEffect(() => {
    _setClassNames(element.className.split(" ").filter(Boolean));
    setNewClassName("");
  }, [element]);

  const removeClassName = (className: string) => {
    const newClassNames = classNames.filter((c) => c !== className);
    _setClassNames(newClassNames);
    setClassNames(newClassNames.join(" "));
  };

  const onAdd = () => {
    const newClassNames = new Set([...newClassName.split(" "), ...classNames]);
    _setClassNames([...newClassNames]);
    setClassNames([...newClassNames].join(" "));
    setNewClassName("");
    setIsAdding(false);
  };

  return (
    <div className="flex mb-2 items-start mr-2 -ml-2 p-2 rounded-lg bg-slate-400">
      <div className="w-24">Class names</div>
      <div className="flex-1 flex flex-col ml-4">
        <div className="flex mb-2">
          <div className="flex-1 h-8">
            {isAdding ? (
              <input
                type="text"
                className="w-full h-full rounded p-2"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
            ) : null}
          </div>
          <div className="w-12 flex justify-center items-center">
            {isAdding ? (
              <RxCheck
                className="w-6 h-6 text-green-700 cursor-pointer"
                onClick={onAdd}
              />
            ) : (
              <RxPlus
                className="w-6 h-6 text-indigo-700 cursor-pointer"
                onClick={() => setIsAdding(true)}
              />
            )}
          </div>
        </div>
        {classNames.map((className, index) => (
          <div key={index} className="flex mb-2">
            <div className="flex-1 rounded bg-slate-200 p-2">{className}</div>
            <div className="w-12 flex justify-center items-center">
              <RxTrash
                className="w-6 h-6 text-red-700 cursor-pointer"
                onClick={() => removeClassName(className)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassNamesEdit;
