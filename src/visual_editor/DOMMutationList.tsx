import React from "react";
import { DeclarativeMutation } from "dom-mutator";
import { FC } from "react";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";
import { RxCross2 } from "react-icons/rx";

const DOMMutationList: FC<{
  mutations: DeclarativeMutation[];
  removeDomMutation: (mutationIndex: number) => void;
}> = ({ mutations: _mutations, removeDomMutation }) => {
  const mutations: DeclarativeMutation[] = [..._mutations];
  const { parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    rightAligned: true,
    bottomAligned: true,
  });

  if (!mutations.length) return null;

  return (
    <div
      style={{ ...parentStyles }}
      className="rounded-lg shadow-xl bg-slate-300 p-4"
    >
      <div className="text-2xl font-semibold text-slate-600 mb-2">Changes</div>
      {mutations.map((mutation, index) => (
        <div key={index} className="flex">
          <div className="text-xl text-slate-700 font-semibold mr-2">
            {index + 1}.
          </div>
          <div className="text-xl text-slate-700 font-semibold mr-2">
            {mutation.attribute}
          </div>
          <div className="text-xl text-slate-700 font-semibold mr-2">
            {mutation.action}
          </div>
          <code className="text-xl font-semibold mr-2">{mutation.value}</code>
          <div className="text-xl text-slate-700 font-semibold mr-2">
            to {mutation.selector}
          </div>
          <div>
            <button
              className="text-rose-500 hover:text-rose-700"
              onClick={() => removeDomMutation(index)}
            >
              <RxCross2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DOMMutationList;
