import { Accordion } from "@chakra-ui/accordion";
import { Input } from "@chakra-ui/input";
import { Heading, Stack } from "@chakra-ui/layout";
import { GrowthBook } from "@growthbook/growthbook";
import React, { useCallback, useEffect, useState } from "react";
import GrowthBookApp from "./GrowthBookApp";
import Feature from "./Feature";
import AttributesSection from "./AttributesSection";
import Experiment from "./Experiment";
import {
  getAttributes,
  getExperimentResults,
  getFeatures,
  whenGrowthBookExists,
  setAttributeOverrides,
  setForcedFeatures,
  setForcedVariations,
} from "./controller";
import { useSessionStorage } from "./util";

function App() {
  const [feats, setFeats] = useState([]);
  const [exps, setExps] = useState([]);
  const [attrs, setAttrs] = useState({});
  const [forcedFeatureValues, setForcedFeatureValues] = useSessionStorage("forcedFeatureValues",{});
  const [forcedVars, setForcedVars] = useSessionStorage("forcedExperimentVariations", {});
  const [attrOverrides, setAttrOverrides] = useSessionStorage("attributeOverrides", null);

  const [q, setQ] = useState("");

  const refresh = useCallback(() => {
    const forcedFeatureMap = new Map(Object.entries(forcedFeatureValues));

    // Make sure page's GrowthBook instance is up-to-date with dev tool overrides
    setAttributeOverrides(attrOverrides || {});
    setForcedVariations(forcedVars);
    setForcedFeatures(forcedFeatureMap);

    // Get latest features, experiment results, and attributes from page's GrowthBook instance
    const features = getFeatures();
    const results = getExperimentResults();
    const attributes = getAttributes();

    // Local GrowthBook instance for debugging
    let log = [];
    const growthbook = new GrowthBook({
      attributes,
      features,
      noWindowRef: true,
      log: (msg, ctx) => {
        log.push([msg, ctx]);
      },
      forcedVariations: forcedVars,
    });
    if (attrOverrides) {
      growthbook.setAttributeOverrides(attrOverrides);
    }
    growthbook.setForcedFeatures(forcedFeatureMap);

    // Update local state of attributes, features, and experiments
    setAttrs(attributes);
    setExps(() => {
      const experiments = [];
      results.forEach(({ experiment }) => {
        growthbook.debug = true;
        const result = growthbook.run(experiment);
        growthbook.debug = false;

        const debug = [...log];
        log = [];

        experiments.push({
          experiment,
          result,
          debug,
        });
      });
      return experiments;
    });
    setFeats(() =>
      Object.keys(features).map((k) => {
        growthbook.debug = true;
        const result = growthbook.feature(k);
        growthbook.debug = false;

        const debug = [...log];
        log = [];

        return {
          key: k,
          feature: features[k],
          result,
          debug,
        };
      })
    );
  }, [attrOverrides, forcedFeatureValues, forcedVars]);

  useEffect(() => whenGrowthBookExists(refresh), [refresh]);

  return (
    <Stack p="5" spacing="5" maxW="container.lg" m="0 auto">
      <GrowthBookApp />
      <Heading as="h1" size="xl">
        GrowthBook Dev Tools
      </Heading>
      <Input
        placeholder="Filter by key..."
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />
      <div>
        <Heading as="h2" size="md" mb="2">
          Features
        </Heading>
        <Accordion allowToggle>
          {feats
            .filter((f) => !q || f.key.includes(q))
            .map(({ key, feature, result, debug }) => (
              <Feature
                key={key}
                id={key}
                feature={feature}
                result={result}
                debug={debug}
                forceValue={(val) => {
                  setForcedFeatureValues((forced) => {
                    return {...forced, [key]: val}
                  });
                }}
                isForced={key in forcedFeatureValues}
                unforce={() => {
                  setForcedFeatureValues((forced) => {
                    const newForced = {...forced};
                    delete newForced[key];
                    return newForced;
                  });
                }}
              />
            ))}
        </Accordion>
      </div>
      <div>
        <Heading as="h2" size="md" mb="2">
          Experiments
        </Heading>
        <Accordion allowToggle>
          {exps
            .filter((e) => !q || e.experiment.key.includes(q))
            .map(({ experiment, result, debug }) => (
              <Experiment
                key={experiment.key}
                experiment={experiment}
                result={result}
                debug={debug}
                force={(variation) => {
                  setForcedVars((vars) => {
                    return {
                      ...vars,
                      [experiment.key]: variation,
                    };
                  });
                }}
                isForced={experiment.key in forcedVars}
                unforce={() => {
                  setForcedVars((existing) => {
                    const newVars = { ...existing };
                    delete newVars[experiment.key];
                    return newVars;
                  });
                }}
              />
            ))}
        </Accordion>
      </div>
      <AttributesSection
        attrs={attrs}
        hasOverrides={!!attrOverrides}
        setAttrs={(val) => {
          setAttrOverrides(val);
        }}
      />
    </Stack>
  );
}

export default App;
