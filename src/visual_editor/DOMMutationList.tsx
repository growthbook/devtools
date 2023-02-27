import React from "react";
import { DeclarativeMutation } from "dom-mutator";
import { FC } from "react";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";

const DOMMutationList: FC<{
  mutations: DeclarativeMutation[];
  removeDomMutation: (mutation: DeclarativeMutation) => void;
}> = ({ mutations }) => {
  const { parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    rightAligned: true,
    bottomAligned: true,
  });
  return (
    <div style={{ ...parentStyles }} className="rounded-lg shadow-xl">
      {mutations.map((mutation, index) => (
        <div key={index}>
          <div>{mutation.action}</div>
          <div>{mutation.selector}</div>
          <div>{mutation.value}</div>
        </div>
      ))}
    </div>
  );
};

export default DOMMutationList;
