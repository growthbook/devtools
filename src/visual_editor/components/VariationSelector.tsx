import React, { FC } from "react";
import { VisualEditorVariation } from "../../../devtools";

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
    <div className="gb-w-full gb-p-4 gb-pt-2">
      <select
        disabled={variations.length === 0}
        className="gb-w-full gb-p-2 gb-border gb-border-gray-300 gb-rounded gb-text-black"
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
