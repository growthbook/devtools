import React, { ReactNode, useCallback } from "react";
import { DeclarativeMutation } from "dom-mutator";
import { FC } from "react";
import { RxCross2 } from "react-icons/rx";
import DOMMutationEditor from "./DOMMutationEditor";

const DOMAttrColumn: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    title={children?.toString()}
    className="mr-1 w-1/5 text-ellipsis overflow-x-hidden whitespace-nowrap"
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
            className="bg-slate-700 odd:bg-slate-600 py-2 text-xs px-2 text-light flex"
          >
            <div className="mr-1 w-8">#{index + 1}</div>

            <DOMAttrColumn>{mutation.action}</DOMAttrColumn>
            <DOMAttrColumn>{mutation.selector}</DOMAttrColumn>
            <DOMAttrColumn>{mutation.attribute}</DOMAttrColumn>
            <DOMAttrColumn>{mutation.value}</DOMAttrColumn>

            {removeDomMutation && (
              <div className="w-8 flex justify-end">
                <RxCross2
                  className="w-4 h-4 cursor-pointer text-link"
                  onClick={() => onRemoveMutation(mutation)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {addMutation && !showEditor && (
        <div className="text-link text-sm" onClick={() => setShowEditor(true)}>
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
