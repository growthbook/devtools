import { Badge, Box } from "@chakra-ui/layout";
import {GrowthBook} from "@growthbook/growthbook";
import {
  GrowthBookProvider,
  useExperiment,
  useFeature,
} from "@growthbook/growthbook-react";

const gb = new GrowthBook({
  features: {
    title: {
      defaultValue: "GrowthBook App",
    },
    color: {
      defaultValue: "green",
      rules: [
        {
          condition: {
            country: "UK"
          },
          force: "blue"
        }
      ]
    },
    "show-exclamation": {
      defaultValue: false,
    },
  },
  attributes: {
    id: "123",
    url: window.location.pathname,
    country: "US",
  }
});

function Component() {
  const title = useFeature("title");
  const color = useFeature("color");
  const show = useFeature("show-exclamation");
  const { value } = useExperiment({
    key: "my-experiment",
    variations: ["control", "variation"],
    weights: [0.2, 0.8]
  });

  return (
    <div>
      <h3 style={{ color: color.value }}>{title.value}</h3>
      {show.on && <div>I Love You!</div>}
      <div>Experiment: {value}</div>
    </div>
  );
}

export default function GrowthBookApp() {
  return (
    <GrowthBookProvider growthbook={gb}>
      <Box bgColor="gray.100" borderWidth={1} p={3}>
        <Badge colorScheme="red">TEMPORARY</Badge>
        <Component />
      </Box>
    </GrowthBookProvider>
  );
}
