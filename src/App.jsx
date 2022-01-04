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
  setAttributes,
  forceFeatureValue,
  getForcedFeatures,
  revertForcedFeature,
} from "./controller";

function App() {
  const [feats, setFeats] = useState([]);
  const [exps, setExps] = useState([]);
  const [attrs, setAttrs] = useState({});
  const [forcedFeatureValues, setForcedFeatureValues] = useState(new Map());

  const [q, setQ] = useState("");

  const updateFeats = useCallback(() => {
    const features = getFeatures();
    const results = getExperimentResults();
    const attributes = getAttributes();
    const forcedFeatures = getForcedFeatures();
    let log = [];
    const growthbook = new GrowthBook({
      attributes,
      features,
      noWindowRef: true,
      log: (msg, ctx) => {
        log.push([msg, ctx]);
      },
    });
    growthbook.setForcedFeatures(forcedFeatures);

    setAttrs(() => attributes);
    setForcedFeatureValues(() => forcedFeatures);
    setExps(() => {
      const experiments = [];
      results.forEach(({ experiment, result }) => {
        growthbook.debug = true;
        growthbook.run(experiment);
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
  }, []);

  useEffect(() => whenGrowthBookExists(updateFeats), [updateFeats]);

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
                  forceFeatureValue(key, val);
                  updateFeats();
                }}
                isForced={forcedFeatureValues.has(key)}
                unforce={() => {
                  revertForcedFeature(key);
                  updateFeats();
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
              />
            ))}
        </Accordion>
      </div>
      <AttributesSection
        attrs={attrs}
        setAttrs={(val) => {
          setAttributes(val);
          updateFeats();
        }}
      />
    </Stack>
  );
}

export default App;
