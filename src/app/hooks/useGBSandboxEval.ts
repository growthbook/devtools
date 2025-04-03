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
import { FeatureDefinitionWithId } from "@/app/components/FeaturesTab";
import { LogUnionWithSource } from "@/app/utils/logs";

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
  const [logEvents] = useTabState<LogUnionWithSource[] | undefined>(
    "logEvents",
    undefined,
  );

  const allFeatures = useMemo(() => {
    let ret = { ...features };
    Object.entries(forcedFeatures).forEach(([key, val]) => {
      if (!(key in features)) {
        ret[key] = {
          id: key,
          noDefinition: true,
        } as FeatureDefinitionWithId;
      }
    });
    (logEvents || [])
      .filter((log) => log.logType === "feature")
      .forEach((log) => {
        if (log.featureKey && !ret?.[log.featureKey]) {
          ret[log.featureKey] = {
            id: log.featureKey,
            noDefinition: true,
          } as FeatureDefinitionWithId;
        }
      });
    return ret;
  }, [features, forcedFeatures, logEvents]);

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
          // Hacky way for associating log to a specific rule:
          // stuff rule number into something persistent (rule.meta -> exp.meta)
          meta: rule.meta
            ? rule.meta.map((m) => ({ ...m, ruleI: i }))
            : [{ ruleI: i }],
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
        navigate: (url) => {},
        applyDomChangesCallback: (changes) => () => {},
        disableExperimentsOnLoad: true,
        trackingCallback: (exp, res) => {
          log.push([`Tracking callback: ${exp.key}`, { exp, res }]);
          // @ts-ignore allow multiple tracks of the same exp
          growthbook._trackedExperiments = new Set();
          // @ts-ignore allow multiple tracks of the same exp
          growthbook._completedChangeIds = new Set();
        },
      });
      growthbook.setForcedFeatures(forcedFeaturesMap);
      await growthbook.init({ payload });

      const evaluatedFeatures: Record<string, EvaluatedFeature> = {};
      const evaluatedExperiments: EvaluatedExperiment[] = [];

      for (const fid in allFeatures) {
        let ruleNo = 0;

        growthbook.debug = true;
        const result = growthbook.evalFeature(fid);
        growthbook.debug = false;

        for (let i = 0; i < log.length; i++) {
          const d = log[i];
          const ctx = d[1];
          if (ctx?.rule?.meta && ctx?.id === fid) {
            ruleNo = ctx.rule.meta[0].ruleI;
          }
          if (ctx?.exp?.meta && ctx.exp.key === fid) {
            ruleNo = ctx.exp.meta[0].ruleI;
          }
          ctx.i = ruleNo;
          d[1] = ctx;
          log[i] = d;
        }
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
