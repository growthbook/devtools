import html2canvas from "html2canvas";
import React, { FC, useEffect, useState } from "react";
import GripHandle from "../Toolbar/GripHandle";
// @ts-expect-error ts-loader can't handle png files yet
import GBLogo from "../../../public/logo192.png";
import clsx from "clsx";

interface ExperimentVariation {
  canvas?: HTMLCanvasElement;
}

interface Experiment {
  variations?: ExperimentVariation[];
}

const ExperimentCreator: FC = () => {
  // x, y position of floating toolbar
  const [x, setX] = useState(24); // pixels
  const [y, setY] = useState(24); // pixels
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(1);

  const isEditingControl = selectedVariationIndex === 0;

  useEffect(() => {
    const initExperiment = async () => {
      // TODO DRY
      const canvas = await html2canvas(document.body, { scale: 0.125 });
      setExperiment({
        ...experiment,
        variations: [{ canvas }, { canvas }],
      });
    };
    initExperiment();
  }, []);

  const appendVariation = () => {
    const addVariation = async () => {
      // TODO DRY
      const canvas = await html2canvas(document.body, { scale: 0.125 });
      setExperiment({
        ...experiment,
        variations: [...(experiment?.variations ?? []), { canvas }],
      });
      setSelectedVariationIndex(experiment?.variations?.length ?? 0);
    };
    addVariation();
  };

  return (
    <div
      className="fixed rounded-xl shadow-xl z-max logo-bg w-96 cursor-default"
      style={{
        top: `${y}px`,
        right: `${x}px`,
      }}
    >
      <div className="flex px-4 h-12 items-center justify-center">
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
                  "relative w-32 h-32 m-4 bg-slate-100 rounded overflow-hidden flex justify-center items-center cursor-pointer",
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
              onClick={() => appendVariation()}
            >
              + Add Variation
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button className="p-2 text-xl" onClick={() => setExperiment({})}>
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
