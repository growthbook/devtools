import { Accordion } from "@chakra-ui/accordion";
import { Input } from "@chakra-ui/input";
import { Box, Heading, HStack, Text } from "@chakra-ui/layout";
import {
  GrowthBook,
  Experiment as ExperimentInterface,
  ExperimentOverride,
  FeatureDefinition,
  Attributes,
} from "@growthbook/growthbook";
import React, { useEffect, useMemo, useState } from "react";
import Feature from "./Feature";
import AttributesSection from "./AttributesSection";
import Experiment from "./Experiment";
import { IconButton } from "@chakra-ui/button";
import { MdHistory } from "react-icons/md";
import { DebugLogs } from "./types";
import { setOverrides } from "./controller";
import Layout from "./Layout";

export interface Props {
  overrides: Record<string, ExperimentOverride>;
  features: Record<string, FeatureDefinition>;
  experiments: Record<string, ExperimentInterface<any>>;
  attributes: Record<string, any>;
}

function App(props: Props) {
  // GrowthBook Overrides
  const [forcedFeatureValues, setForcedFeatureValues] = useState<
    Record<string, any>
  >({});
  const [forcedVars, setForcedVars] = useState<Record<string, number>>({});
  const [attrOverrides, setAttrOverrides] = useState<Attributes | null>(null);

  // Filter search term
  const [q, setQ] = useState("");

  // When overrides change, update the page
  useEffect(() => {
    setOverrides({
      attributes: attrOverrides || {},
      features: forcedFeatureValues,
      variations: forcedVars,
    });
  }, [forcedFeatureValues, forcedVars, attrOverrides]);

  // Build list of features, experiments, and attributes data based on props and overrides
  const { features, experiments, attributes } = useMemo(() => {
    const forcedFeatureMap = new Map(Object.entries(forcedFeatureValues));

    const { features, experiments, attributes, overrides } = props;

    // Local GrowthBook instance for debugging
    let log: DebugLogs = [];
    const growthbook = new GrowthBook({
      attributes,
      features,
      overrides,
      disableDevTools: true,
      log: (msg: string, ctx: any) => {
        log.push([msg, ctx]);
      },
      forcedVariations: forcedVars,
    });
    if (attrOverrides) {
      growthbook.setAttributeOverrides(attrOverrides);
    }
    growthbook.setForcedFeatures(forcedFeatureMap);

    return {
      attributes,
      experiments: Object.keys(experiments).map((key) => {
        const experiment = experiments[key];
        growthbook.debug = true;
        const result = growthbook.run(experiment);
        growthbook.debug = false;

        const debug = [...log];
        log = [];

        return {
          experiment,
          result,
          debug,
        };
      }),
      features: Object.keys(features).map((k) => {
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
      }),
    };
  }, [props, forcedVars, forcedFeatureValues, attrOverrides]);

  const filteredFeatures = features.filter((f) => !q || f.key.includes(q));
  const filteredExperiments = experiments.filter(
    (e) => !q || e.experiment.key.includes(q)
  );

  return (
    <Layout
      overrides={{
        attributes: attrOverrides || {},
        features: forcedFeatureValues,
        variations: forcedVars,
      }}
    >
      <Input
        placeholder="Filter by key..."
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />
      <Box pb={4}>
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
          {filteredFeatures.map(({ key, feature, result, debug }) => (
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
        {!filteredFeatures.length && <Text color="gray.500">No Features</Text>}
      </Box>
      <Box pb={4}>
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
          {filteredExperiments.map(({ experiment, result, debug }) => (
            <Experiment
              key={experiment.key}
              experiment={experiment}
              result={result}
              debug={debug}
              override={props.overrides[experiment.key]}
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
        {!filteredExperiments.length && (
          <Text color="gray.500">No Experiments</Text>
        )}
      </Box>
      <AttributesSection
        attrs={attributes}
        hasOverrides={!!attrOverrides}
        setAttrs={(val) => {
          setAttrOverrides(val);
        }}
      />
    </Layout>
  );
}

export default App;
