import { Accordion } from "@chakra-ui/accordion";
import { Input } from "@chakra-ui/input";
import { Heading, Stack } from "@chakra-ui/layout";
import { GrowthBook } from "@growthbook/growthbook";
import React, { useCallback, useEffect, useState } from "react";
import GrowthBookApp from "./GrowthBookApp";
import Feature from "./Feature";
import AttributesSection from "./AttributesSection";
import Experiment from "./Experiment";

function App() {
  const [feats, setFeats] = useState([]);
  const [exps, setExps] = useState([]);
  const [attrs, setAttrs] = useState({});

  const [q, setQ] = useState("");

  const updateFeats = useCallback(() => {
    if (window._growthbook) {
      const gb = window._growthbook;
      if (!gb) return;
      const features = gb.getFeatures();
      const results = gb.getAllResults();
      const attributes = gb.getAttributes();
      let log = [];
      const growthbook = new GrowthBook({
        attributes,
        features,
        noWindowRef: true,
        log: (msg, ctx) => {
          log.push([msg, ctx]);
        },
      });

      setAttrs(() => attributes);

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
      setExps(experiments);

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
    }
  }, []);

  // Poll for global window._growthbook to exist
  useEffect(() => {
    let cancel = false;
    let timer;
    const cb = () => {
      if (cancel) return;
      if (window._growthbook) {
        updateFeats();
      } else {
        timer = window.setTimeout(cb, 200);
      }
    };
    cb();

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [updateFeats]);

  return (
    <Stack p="5" spacing="5">
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
          window._growthbook?.setAttributes(val);
          updateFeats();
        }}
      />
    </Stack>
  );
}

export default App;
