import {
  APIExperiment,
  APIExperimentVariation,
  APIVisualChange,
  APIVisualChangeset,
  VisualEditorVariation,
} from "../../../devtools";
const normalizeVariations = ({
  experiment,
  visualChangeset,
}: {
  experiment: APIExperiment;
  visualChangeset: APIVisualChangeset;
}): VisualEditorVariation[] => {
  const { variations } = experiment;
  const { visualChanges } = visualChangeset;
  const visualChangesByVariationId = visualChanges.reduce(
    (acc: Record<string, APIVisualChange>, visualChange: APIVisualChange) => {
      const { variation } = visualChange;
      acc[variation] = visualChange;
      return acc;
    },
    {}
  );

  return variations.map((variation: APIExperimentVariation) => {
    const { name, description, variationId } = variation;
    const {
      css = "",
      js = "",
      domMutations = [],
    } = visualChangesByVariationId[variation.variationId] ?? {};
    return {
      name,
      description,
      variationId,
      css,
      js,
      domMutations,
    };
  });
};

export default normalizeVariations;
