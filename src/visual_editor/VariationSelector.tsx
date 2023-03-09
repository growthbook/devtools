import React, { FC, useEffect, useRef } from "react";
import { ExperimentVariation } from ".";

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
  const prevVariationsCount = useRef(1);

  useEffect(() => {
    if (!variations?.length) return;
    const lastVarIndex = variations.length - 1;
    if (lastVarIndex !== prevVariationsCount.current) {
      setSelectedVariationIndex(lastVarIndex);
      prevVariationsCount.current = lastVarIndex;
    }
  }, [variations]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (value === -1) return createVariation();
    setSelectedVariationIndex(value);
  };

  return (
    <div className="w-full p-4">
      <select
        className="w-full p-2 border border-gray-300 rounded"
        value={selectedVariationIndex}
        onChange={onChange}
      >
        {variations.map((_variation, index) => (
          <option key={index} value={index}>
            {index === 0 ? "Control" : `Variation ${index}`}
          </option>
        ))}
        <option value={-1}>+ Add variation</option>
      </select>
    </div>
  );
};

export default VariationSelector;
