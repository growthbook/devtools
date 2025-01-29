import {useMemo} from "react";
import {Attributes, Experiment, FeatureDefinition, FeatureResult, GrowthBook, Result} from "@growthbook/growthbook";
import useTabState from "@/app/hooks/useTabState";
import {DebugLogs} from "devtools";

export type EvaluatedFeature = {
  result: FeatureResult;
  debug: [string, any][];
};

export type EvaluatedExperiment = {
  key: string;
  result: Result<any>;
  debug: [string, any][];
};

export default function useGBSandboxEval() {
  const [attributes] = useTabState<Attributes>("attributes", {});
  const [features] = useTabState<Record<string, FeatureDefinition>>("features", {});
  const [experiments] = useTabState<Experiment<any>[]>("experiments", []);
  const [forcedFeatures] = useTabState<Map<string, any>>("forcedFeatures", new Map());
  const [forcedVariations] = useTabState<Record<string, number>>("forcedVariations", {});
  const [url] = useTabState<string>("url", "");
  let forcedFeaturesMap = new Map<string, any>();
  try {
    // because persistent state is JSON encoded, need to make sure this specific var is safe to use
    forcedFeaturesMap = forcedFeatures && (forcedFeatures instanceof Map) ?
      forcedFeatures :
      new Map(Object.entries(forcedFeatures));
  } catch (_) {
    // do nothing
  }

  return useMemo(() => {
    let log: DebugLogs = [];

    const payload = {features, experiments};

    const growthbook = new GrowthBook({
      attributes,
      forcedVariations,
      url,
      log: (msg: string, ctx: any) => {
        log.push([msg, ctx]);
      },
    });
    growthbook.setForcedFeatures(forcedFeaturesMap);
    growthbook.initSync({payload});

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
      }
    }

    experiments.forEach((experiment) => {
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
  }, [attributes, features, experiments, forcedFeaturesMap, forcedVariations, url]);
}
