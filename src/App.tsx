import { Accordion } from "@chakra-ui/accordion";
import { Input } from "@chakra-ui/input";
import { Heading, HStack, Stack } from "@chakra-ui/layout";
import {
  GrowthBook,
  Experiment as ExperimentInterface,
  FeatureDefinition,
  Attributes,
} from "@growthbook/growthbook";
import React, { useEffect, useMemo, useState } from "react";
import Feature from "./Feature";
import AttributesSection from "./AttributesSection";
import Experiment from "./Experiment";
import { IconButton } from "@chakra-ui/button";
import { MdHistory, MdRefresh } from "react-icons/md";
import { DebugLogs } from "./types";
import { requestRefresh, setOverrides } from "./controller";

export interface Props {
  features: Record<string, FeatureDefinition>;
  experiments: Record<string, ExperimentInterface>;
  attributes: Record<string, any>;
}

function App(props: Props) {
  // GrowthBook Overrides
  const [forcedFeatureValues, setForcedFeatureValues] = useState<Record<string, any>>({});
  const [forcedVars, setForcedVars] = useState<Record<string, number>>({});
  const [attrOverrides, setAttrOverrides] = useState<Attributes|null>(null);

  // Filter search term
  const [q, setQ] = useState("");

  // When overrides change, update the page
  useEffect(() => {
    setOverrides({
      attributes: attrOverrides||{},
      features: forcedFeatureValues,
      variations: forcedVars
    });
  }, [forcedFeatureValues, forcedVars, attrOverrides])

  // Build list of features, experiments, and attributes data based on props and overrides
  const {features, experiments, attributes} = useMemo(() => {
    const forcedFeatureMap = new Map(Object.entries(forcedFeatureValues));

    const { features, experiments, attributes } = props;

    // Local GrowthBook instance for debugging
    let log: DebugLogs = [];
    const growthbook = new GrowthBook({
      attributes,
      features,
      noWindowRef: true,
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
  
        return ({
          experiment,
          result,
          debug,
        });
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
      })
    }
  }, [props, forcedVars, forcedFeatureValues, attrOverrides]);

  return (
    <Stack p="5" spacing="5" maxW="container.lg" m="0 auto">
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
            requestRefresh();
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
          {features
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
          {experiments
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
        attrs={attributes}
        hasOverrides={!!attrOverrides}
        setAttrs={(val) => {
          setAttrOverrides(val);
        }}
      />
    </Stack>
  );
}

export default App;
