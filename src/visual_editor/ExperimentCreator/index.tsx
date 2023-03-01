import React, { FC, useEffect, useRef } from "react";
import GripHandle from "../GripHandle";
// @ts-expect-error ts-loader can't handle png files yet
import GBLogo from "../../../public/logo192.png";
import { ExperimentVariation } from "..";
import useFixedPositioning from "../lib/hooks/useFixedPositioning";
import Toolbar from "../Toolbar";
import { ToolbarMode } from "../Toolbar";

const VariationSelector: FC<{
  variations: ExperimentVariation[];
  selectedVariationIndex: number;
  setSelectedVariationIndex: (i: number) => void;
  createVariation: () => void;
}> = ({
  variations,
  selectedVariationIndex,
  setSelectedVariationIndex,
  createVariation,
}) => {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (value === -1) return createVariation();
    setSelectedVariationIndex(value);
  };
  return (
    <div className="w-full text-xl p-4">
      <select
        className="w-full p-2 border border-gray-300 rounded"
        value={selectedVariationIndex}
        onChange={onChange}
      >
        {variations.map((variation, index) => (
          <option key={index} value={index}>
            {index === 0 ? "Control" : `Variation ${index}`}
          </option>
        ))}
        <option value={-1}>+ Add variation</option>
      </select>
    </div>
  );
};

const ExperimentCreator: FC<{
  variations: ExperimentVariation[];
  createVariation: () => void;
  selectedVariationIndex: number;
  setSelectedVariationIndex: (i: number) => void;
  mode: ToolbarMode;
  setMode: (mode: ToolbarMode) => void;
}> = ({
  variations,
  createVariation,
  selectedVariationIndex,
  setSelectedVariationIndex,
  mode,
  setMode,
}) => {
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
  });
  const prevVariationsCount = useRef(1);

  // select most recently created variation
  useEffect(() => {
    if (!variations?.length) return;
    const lastVarIndex = variations.length - 1;
    if (lastVarIndex !== prevVariationsCount.current) {
      setSelectedVariationIndex(lastVarIndex);
      prevVariationsCount.current = lastVarIndex;
    }
  }, [variations]);

  return (
    <div
      className="rounded-xl shadow-xl z-max w-96 cursor-default exp-creator bg-slate-800"
      style={{
        ...parentStyles,
      }}
    >
      <div className="flex px-4 h-12 items-center justify-center rounded-t-xl logo-bg ">
        <div className="h-8">
          <img src={GBLogo} alt="GB Logo" className="w-auto h-full mr-1" />
        </div>
        <div className="font-semibold text-white">
          GrowthBook Visual Editor v2
        </div>
      </div>

      <VariationSelector
        variations={variations}
        selectedVariationIndex={selectedVariationIndex}
        setSelectedVariationIndex={setSelectedVariationIndex}
        createVariation={createVariation}
      />

      <Toolbar mode={mode} setMode={setMode} />

      <GripHandle
        className="bg-slate-800 h-5 w-full rounded-b-xl"
        x={x}
        y={y}
        setX={setX}
        setY={setY}
      />
    </div>
  );
};

export default ExperimentCreator;
