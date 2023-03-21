import React, { FC } from "react";
import { VisualEditorVariation } from ".";

const VariationSelector: FC<{
  variations: VisualEditorVariation[];
  selectedVariationIndex: number;
  setSelectedVariationIndex: (i: number) => void;
}> = ({ variations, selectedVariationIndex, setSelectedVariationIndex }) => {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedVariationIndex(value);
  };

  return (
    <div className="w-full p-4">
      <select
        className="w-full p-2 border border-gray-300 rounded"
        value={selectedVariationIndex}
        onChange={onChange}
      >
        {variations.map((variation, index) => (
          <option key={index} value={index}>
            {variation.name ?? (index === 0 ? "Control" : `Variation ${index}`)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VariationSelector;
