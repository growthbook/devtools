import React, { FC, useEffect, useState } from "react";
import GripHandle from "../Toolbar/GripHandle";
// @ts-expect-error ts-loader can't handle png files yet
import GBLogo from "../../../public/logo192.png";

interface ExperimentVariation {
  imgUrl: string;
}

interface Experiment {
  variations: ExperimentVariation[];
}

const ExperimentCreator: FC = () => {
  // x, y position of floating toolbar
  const [x, setX] = useState(24); // pixels
  const [y, setY] = useState(24); // pixels
  const [experiment, setExperiment] = useState<Experiment | null>(null);

  useEffect(() => {
    if (!experiment) return;

    if (!experiment?.variations?.length) {
      setExperiment({
        ...experiment,
        // TODO create snapshot of control
        variations: [{ imgUrl: GBLogo }],
      });
    }
  }, [experiment]);

  return (
    <div
      className="fixed rounded-xl shadow-xl z-max logo-bg"
      style={{
        top: `${y}px`,
        right: `${x}px`,
      }}
    >
      <div className="flex px-4 h-12 w-96 items-center justify-center">
        <div className="h-8">
          <img src={GBLogo} alt="GB Logo" className="w-auto h-full mr-1" />
        </div>
        <div className="font-semibold text-white">
          GrowthBook Visual Editor v2
        </div>
      </div>

      <div className="relative bg-slate-800 py-4 text-white">
        <div className="flex justify-center">
          <button className="p-2 text-xl">+ New Experiment</button>
        </div>
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
