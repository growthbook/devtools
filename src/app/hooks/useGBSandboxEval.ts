import { useMemo } from "react";
import {
  Attributes,
  Experiment,
  FeatureDefinition,
  FeatureResult,
  GrowthBook,
  Result,
} from "@growthbook/growthbook";
import useTabState from "@/app/hooks/useTabState";
import { DebugLogs } from "devtools";
import { getFeatureExperiments } from "@/app/components/ExperimentsTab";
import useSdkData from "./useSdkData";

export type EvaluatedFeature = {
  result: FeatureResult;
  debug: DebugLogs;
};

export type EvaluatedExperiment = {
  key: string;
  result: Result<any>;
  debug: DebugLogs;
};

export default function useGBSandboxEval() {
  const { payload: sdkPayload } = useSdkData();
  const [attributes] = useTabState<Attributes>("attributes", {});
  const [features] = useTabState<Record<string, FeatureDefinition>>(
    "features",
    {},
  );
  const [experiments] = useTabState<Experiment<any>[]>("experiments", []);
  const [forcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );
  const [forcedVariations] = useTabState<Record<string, number>>(
    "forcedVariations",
    {},
  );
  const [url] = useTabState<string>("url", "");
  const forcedFeaturesMap = new Map(Object.entries(forcedFeatures));

  return useMemo(() => {
    let log: DebugLogs = [];

    const featureExperiments = getFeatureExperiments(features);

    // add extra info (index) for debugging:
    const _features = {...features};
    for (const fid in _features) {
      _features[fid].rules = _features[fid]?.rules?.map((rule, i) => ({
        ...rule, i,
      }));
    }

    const payload = { ...sdkPayload, features: _features, experiments };

    const growthbook = new GrowthBook({
      attributes,
      forcedVariations,
      url,
      log: (msg: string, ctx: any) => {
        log.push([msg, ctx]);
      },
    });
    growthbook.setForcedFeatures(forcedFeaturesMap);
    growthbook.initSync({ payload });

    const evaluatedFeatures: Record<string, EvaluatedFeature> = {};
    const evaluatedExperiments: EvaluatedExperiment[] = [];

    for (const fid in features) {
      growthbook.debug = true;
      const result = growthbook.evalFeature(fid);
      growthbook.debug = false;
      const debug = [...log];
      log = [];

      evaluatedFeatures[fid] = {
        result,
        debug,
      };
    }

    [...experiments, ...featureExperiments].forEach((experiment) => {
      growthbook.debug = true;
      const result = growthbook.run(experiment);
      growthbook.debug = false;
      const debug = [...log];
      log = [];

      evaluatedExperiments.push({
        key: experiment.key,
        result,
        debug,
      });
    });

    growthbook.destroy();

    return {
      evaluatedFeatures,
      evaluatedExperiments,
    };
  }, [
    attributes,
    features,
    experiments,
    forcedFeaturesMap,
    forcedVariations,
    url,
  ]);
}
