import { useEffect, useState, useMemo } from "react";
import {
  Attributes,
  AutoExperiment,
  FeatureDefinition,
  FeatureResult,
  GrowthBook,
  Result,
  StickyAssignmentsDocument,
  StickyBucketService,
} from "@growthbook/growthbook";
import useTabState from "@/app/hooks/useTabState";
import { DebugLog } from "devtools";
import { getFeatureExperiments } from "@/app/components/ExperimentsTab";
import useSdkData from "./useSdkData";

export type EvaluatedFeature = {
  result: FeatureResult;
  debug: DebugLog[];
};

export type EvaluatedExperiment = {
  key: string;
  changeId?: string;
  result: Result<any>;
  debug: DebugLog[];
};

export default function useGBSandboxEval() {
  const {
    payload: sdkPayload,
    usingStickyBucketing,
    stickyBucketAssignmentDocs,
  } = useSdkData();
  const [attributes] = useTabState<Attributes>("attributes", {});
  const [features] = useTabState<Record<string, FeatureDefinition>>(
    "features",
    {},
  );
  const [experiments] = useTabState<AutoExperiment[]>("experiments", []);
  const [forcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );
  const [forcedVariations] = useTabState<Record<string, number>>(
    "forcedVariations",
    {},
  );
  const [url] = useTabState<string>("url", "");
  const forcedFeaturesMap = useMemo(
    () => new Map(Object.entries(forcedFeatures)),
    [forcedFeatures],
  );

  const [evaluatedData, setEvaluatedData] = useState<{
    evaluatedFeatures: Record<string, EvaluatedFeature>;
    evaluatedExperiments: EvaluatedExperiment[];
  }>({
    evaluatedFeatures: {},
    evaluatedExperiments: [],
  });

  useEffect(() => {
    let isMounted = true;

    const evaluate = async () => {
      let log: DebugLog[] = [];

      const featureExperiments = getFeatureExperiments(features);

      const _features = { ...features };
      for (const fid in _features) {
        _features[fid].rules = _features[fid]?.rules?.map((rule, i) => ({
          ...rule,
          i,
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
        stickyBucketService: usingStickyBucketing
          ? new SandboxStickyBucketService()
          : undefined,
        stickyBucketAssignmentDocs,
      });
      growthbook.setForcedFeatures(forcedFeaturesMap);
      await growthbook.init({ payload });

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
          changeId: "changeId" in experiment ? experiment.changeId : undefined,
          result,
          debug,
        });
      });

      growthbook.destroy();

      if (isMounted) {
        setEvaluatedData({
          evaluatedFeatures,
          evaluatedExperiments,
        });
      }
    };

    evaluate();

    return () => {
      isMounted = false;
    };
  }, [
    attributes,
    features,
    experiments,
    forcedFeaturesMap,
    forcedVariations,
    url,
    usingStickyBucketing,
    stickyBucketAssignmentDocs,
    sdkPayload,
  ]);

  return evaluatedData;
}

export class SandboxStickyBucketService extends StickyBucketService {
  private store: Record<string, StickyAssignmentsDocument> = {};

  async getAssignments(attributeName: string, attributeValue: string) {
    const key = this.getKey(attributeName, attributeValue);
    return this.store[key] || null;
  }

  async saveAssignments(doc: StickyAssignmentsDocument) {
    const key = this.getKey(doc.attributeName, doc.attributeValue);
    this.store[key] = doc;
  }
}
