import React, { ReactNode, useCallback } from "react";
import { DeclarativeMutation } from "dom-mutator";
import { FC } from "react";
import { RxCross2 } from "react-icons/rx";
import DOMMutationEditor from "./DOMMutationEditor";

const DOMAttrColumn: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    title={children?.toString()}
    className="gb-mr-1 gb-w-1/5 gb-text-ellipsis gb-overflow-x-hidden gb-whitespace-nowrap"
  >
    {children}
  </div>
);

const DOMMutationList: FC<{
  globalCss?: string;
  mutations: DeclarativeMutation[];
  addMutation?: (mutation: DeclarativeMutation) => void;
  removeDomMutation?: (mutation: DeclarativeMutation) => void;
  clearGlobalCss?: () => void;
}> = ({
  addMutation,
  mutations: _mutations,
  removeDomMutation,
  globalCss,
  clearGlobalCss,
}) => {
  const mutations: DeclarativeMutation[] = [
    ...(globalCss
      ? [
          {
            selector: "global",
            action: "set" as DeclarativeMutation["action"],
            value: globalCss,
            attribute: "css",
          },
        ]
      : []),
    ..._mutations,
  ];
  const [showEditor, setShowEditor] = React.useState(false);

  const onRemoveMutation = useCallback(
    (mutation: DeclarativeMutation) => {
      if (mutation.selector === "global" && mutation.attribute === "css") {
        clearGlobalCss?.();
        return;
      }
      removeDomMutation?.(mutation);
    },
    [removeDomMutation, clearGlobalCss]
  );

  return (
    <div className="px-4 ">
      <div className="mb-4">
        {mutations.map((mutation, index) => (
          <div
            key={index}
            className="gb-bg-slate-700 odd:gb-bg-slate-600 gb-py-2 gb-text-xs gb-px-2 gb-text-light gb-flex"
          >
            <div className="gb-mr-1 gb-w-8">#{index + 1}</div>

            <DOMAttrColumn>{mutation.action}</DOMAttrColumn>
            <DOMAttrColumn>{mutation.selector}</DOMAttrColumn>
            <DOMAttrColumn>{mutation.attribute}</DOMAttrColumn>
            <DOMAttrColumn>{mutation.value}</DOMAttrColumn>

            {removeDomMutation && (
              <div className="gb-w-8 flex gb-justify-end">
                <RxCross2
                  className="gb-w-4 gb-h-4 gb-cursor-pointer gb-text-link"
                  onClick={() => onRemoveMutation(mutation)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {addMutation && !showEditor && (
        <div className="gb-text-link gb-text-sm" onClick={() => setShowEditor(true)}>
          + Add custom DOM mutation
        </div>
      )}

      {showEditor && addMutation && (
        <DOMMutationEditor
          addMutation={addMutation}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default DOMMutationList;
