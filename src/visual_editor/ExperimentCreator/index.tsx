import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import GBLogo from "../../../public/logo192.png";
import { ExperimentVariation } from "..";
import Toolbar from "../Toolbar";
import { ToolbarMode } from "../Toolbar";
import DOMMutationList from "../DOMMutationList";
import VisualEditorSection from "../VisualEditorSection";

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
  updateSelectedVariation: (updates: Partial<ExperimentVariation>) => void;
}> = ({
  variations,
  createVariation,
  selectedVariationIndex,
  setSelectedVariationIndex,
  mode,
  setMode,
  updateSelectedVariation,
}) => {
  const prevVariationsCount = useRef(1);
  const selectedVariation = variations[selectedVariationIndex];
  const removeDomMutation = useCallback(
    (domMutationIndex: number) => {
      updateSelectedVariation({
        domMutations: selectedVariation.domMutations.filter(
          (mutation, i) => i !== domMutationIndex
        ),
      });
    },
    [updateSelectedVariation, selectedVariation]
  );

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
    <div className="z-max w-full cursor-default">
      <div className="flex px-4 h-12 items-center justify-center rounded-t-xl logo-bg ">
        <div className="h-8">
          <img src={GBLogo} alt="GB Logo" className="w-auto h-full mr-1" />
        </div>
        <div className="font-semibold text-white">GrowthBook Visual Editor</div>
      </div>

      <VariationSelector
        variations={variations}
        selectedVariationIndex={selectedVariationIndex}
        setSelectedVariationIndex={setSelectedVariationIndex}
        createVariation={createVariation}
      />

      <Toolbar mode={mode} setMode={setMode} />

      <VisualEditorSection
        isExpanded={false}
        title={`Changes (${selectedVariation.domMutations.length})`}
      >
        <DOMMutationList
          removeDomMutation={removeDomMutation}
          mutations={selectedVariation?.domMutations ?? []}
        />
      </VisualEditorSection>
    </div>
  );
};

export default ExperimentCreator;
