import React, { ReactNode } from "react";
import { DeclarativeMutation } from "dom-mutator";
import { FC } from "react";
import { RxCross2 } from "react-icons/rx";

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
  removeDomMutation?: (mutationIndex: number) => void;
}> = ({ mutations: _mutations, removeDomMutation, globalCss }) => {
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

  if (!mutations.length) return null;

  return (
    <div className="px-4 mb-4">
      {mutations.map((mutation, index) => (
        <div
          key={index}
          className="bg-slate-700 odd:bg-slate-600 py-2 text-xs px-2 text-slate-300 flex"
        >
          <div className="mr-1 w-8">#{index + 1}</div>

          <DOMAttrColumn>{mutation.action}</DOMAttrColumn>
          <DOMAttrColumn>{mutation.selector}</DOMAttrColumn>
          <DOMAttrColumn>{mutation.attribute}</DOMAttrColumn>
          <DOMAttrColumn>{mutation.value}</DOMAttrColumn>

          {removeDomMutation && (
            <div className="w-8 flex justify-end">
              <RxCross2
                className="w-4 h-4 cursor-pointer hover:text-slate-100"
                onClick={() => removeDomMutation(index)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DOMMutationList;
