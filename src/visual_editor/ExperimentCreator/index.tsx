import React, { FC, useEffect, useRef, useState } from "react";
import GripHandle from "../GripHandle";
// @ts-expect-error ts-loader can't handle png files yet
import GBLogo from "../../../public/logo192.png";
import clsx from "clsx";
import { Experiment } from "..";

const ExperimentCreator: FC<{
  experiment: Experiment | null;
  createExperiment: () => void;
  createVariation: () => void;
}> = ({ experiment, createExperiment, createVariation }) => {
  const [x, setX] = useState(24); // pixels
  const [y, setY] = useState(24); // pixels
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(1);
  const prevVariationsCount = useRef(1);

  // select most recently created variation
  useEffect(() => {
    if (!experiment) return;
    const { variations } = experiment;
    if (!variations?.length) return;
    const lastVarIndex = variations.length - 1;
    if (lastVarIndex !== prevVariationsCount.current) {
      setSelectedVariationIndex(lastVarIndex);
      prevVariationsCount.current = lastVarIndex;
    }
  }, [experiment]);

  return (
    <div
      className="fixed rounded-xl shadow-xl z-max w-96 cursor-default exp-creator"
      style={{
        top: `${y}px`,
        right: `${x}px`,
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

      <div className="relative bg-slate-800 py-4 text-white flex justify-center">
        {experiment ? (
          <div className="flex flex-wrap justify-start w-10/12">
            {experiment.variations?.map((variation, i) => (
              <div
                key={i}
                className={clsx(
                  "relative w-32 h-32 m-4 bg-slate-100 rounded overflow-hidden flex justify-center items-center cursor-pointer hover:scale-105 transition-transform duration-500",
                  {
                    "outline outline-4 outline-amber-300":
                      i === selectedVariationIndex,
                  }
                )}
                onClick={() => setSelectedVariationIndex(i)}
              >
                <img
                  className="min-w-full min-h-full object-cover"
                  src={variation.canvas?.toDataURL()}
                  alt="Variation"
                />
                <div
                  className={clsx(
                    "absolute inset-0 text-xl font-semibold flex justify-center items-center",
                    {
                      "bg-slate-500/75": i !== selectedVariationIndex,
                      "text-slate-700": i === selectedVariationIndex,
                      "text-white": i !== selectedVariationIndex,
                    }
                  )}
                >
                  {i === 0 ? "Control" : `Variation ${i}`}
                </div>
              </div>
            ))}
            <div
              className="w-32 h-32 m-4 border-4 border-slate-300 border-dashed rounded flex items-center text-slate-300 text-xl font-semibold text-center cursor-pointer hover:border-slate-100 hover:text-slate-100"
              onClick={() => createVariation()}
            >
              + Add Variation
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button className="p-2 text-xl" onClick={() => createExperiment()}>
              + New Experiment
            </button>
          </div>
        )}
      </div>

      <GripHandle
        reverseX
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
