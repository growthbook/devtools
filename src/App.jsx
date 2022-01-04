import { Accordion } from "@chakra-ui/accordion";
import { Input } from "@chakra-ui/input";
import { Heading, HStack, Stack } from "@chakra-ui/layout";
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
import { IconButton } from "@chakra-ui/button";
import { MdHistory, MdRefresh } from "react-icons/md";

function App() {
  const [feats, setFeats] = useState([]);
  const [exps, setExps] = useState([]);
  const [attrs, setAttrs] = useState({});
  const [forcedFeatureValues, setForcedFeatureValues] = useState({});
  const [forcedVars, setForcedVars] = useState({});
  const [attrOverrides, setAttrOverrides] = useState(null);

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
      <HStack>
        <Heading as="h1" size="xl">
          GrowthBook Dev Tools
        </Heading>

        <IconButton
          size="sm"
          variant="ghost"
          ml={2}
          icon={<MdRefresh size="18px" />}
          aria-label="Refresh Data"
          title="Refresh Data"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            refresh();
          }}
        />
      </HStack>
      <Input
        placeholder="Filter by key..."
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />
      <div>
        <HStack>
          <Heading as="h2" size="md" mb="2">
            Features
          </Heading>

          {Object.keys(forcedFeatureValues).length > 0 && (
            <IconButton
              size="xs"
              variant="ghost"
              ml={2}
              icon={<MdHistory size="18px" />}
              aria-label="Revert Feature Overrides"
              title="Revert Feature Overrides"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setForcedFeatureValues({});
              }}
            />
          )}
        </HStack>
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
                    return { ...forced, [key]: val };
                  });
                }}
                isForced={key in forcedFeatureValues}
                unforce={() => {
                  setForcedFeatureValues((forced) => {
                    const newForced = { ...forced };
                    delete newForced[key];
                    return newForced;
                  });
                }}
              />
            ))}
        </Accordion>
      </div>
      <div>
        <HStack>
          <Heading as="h2" size="md" mb="2">
            Experiments
          </Heading>

          {Object.keys(forcedVars).length > 0 && (
            <IconButton
              size="xs"
              variant="ghost"
              ml={2}
              icon={<MdHistory size="18px" />}
              aria-label="Revert Experiment Overrides"
              title="Revert Experiment Overrides"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setForcedVars({});
              }}
            />
          )}
        </HStack>
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
