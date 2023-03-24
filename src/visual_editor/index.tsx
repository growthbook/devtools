import mutate, { DeclarativeMutation } from "dom-mutator";
import qs from "query-string";
import React, {
  FC,
  useCallback,
  useEffect,
  useRef,
  useReducer,
  useState,
  useMemo,
} from "react";
import * as ReactDOM from "react-dom/client";
import { Message } from "../../devtools";
import Toolbar, { ToolbarMode } from "./Toolbar";
import {
  toggleNormalMode,
  toggleSelectionMode,
  updateSelectedElement,
  toggleCssMode,
  toggleMutationMode,
  toggleScreenshotMode,
} from "./lib/modes";
import "./targetPage.css";
import ElementDetails from "./ElementDetails";
import HighlightedElementSelectorDisplay from "./HighlightedElementSelectorDisplay";
// @ts-expect-error ts-loader does not understand this .css import
import VisualEditorCss from "./index.css";
import GlobalCSSEditor from "./GlobalCSSEditor";
import DOMMutationEditor from "./DOMMutationEditor";
import VisualEditorPane from "./VisualEditorPane";
import VisualEditorSection from "./VisualEditorSection";
import BreadcrumbsView from "./ElementDetails/BreadcrumbsView";
import ClassNamesEdit from "./ElementDetails/ClassNamesEdit";
import getSelector from "./lib/getSelector";
import DOMMutationList from "./DOMMutationList";
import VariationSelector from "./VariationSelector";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";
import VisualEditorHeader from "./VisualEditorHeader";
import useApi, {
  APICreds,
  APIDomMutation,
  APIExperiment,
  APIExperimentVariation,
  APIVisualChange,
  APIVisualChangeset,
} from "./lib/hooks/useApi";
import AttributeEdit, {
  Attribute,
  IGNORED_ATTRS,
} from "./ElementDetails/AttributeEdit";
import SetApiCredsAlert from "./SetApiCredsAlert";

const VISUAL_CHANGESET_ID_PARAMS_KEY = "vc-id";
const VARIATION_INDEX_PARAMS_KEY = "v-idx";
const EXPERIMENT_URL_PARAMS_KEY = "exp-url";

export interface VisualEditorVariation {
  name: string;
  description: string;
  css?: string;
  domMutations: APIDomMutation[];
  variationId: string;
}

let _globalStyleTag: HTMLStyleElement | null = null;

// normalize API payloads into local object shape
const genVisualEditorVariations = ({
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
    const { css = "", domMutations = [] } =
      visualChangesByVariationId[variation.variationId] ?? {};
    return {
      name,
      description,
      variationId,
      css,
      domMutations,
    };
  });
};

const getVariationIndexFromParams = (
  param: string | (string | null)[] | null
): number => {
  if (Array.isArray(param)) {
    if (!param[0]) return 1;
    return parseInt(param[0], 10);
  }
  return parseInt(param ?? "1", 10);
};

const cleanUpParams = (params: qs.ParsedQuery) => {
  window.history.replaceState(
    null,
    "",
    qs.stringifyUrl({
      url: window.location.href,
      query: {
        ...params,
        [VISUAL_CHANGESET_ID_PARAMS_KEY]: undefined,
        [VARIATION_INDEX_PARAMS_KEY]: undefined,
        [EXPERIMENT_URL_PARAMS_KEY]: undefined,
      },
    })
  );
};

const VisualEditor: FC<{}> = () => {
  const params = qs.parse(window.location.search);
  const [visualChangesetId] = useState(
    params[VISUAL_CHANGESET_ID_PARAMS_KEY] as string
  );
  const [variationIndex] = useState(
    getVariationIndexFromParams(params[VARIATION_INDEX_PARAMS_KEY])
  );
  const [experimentUrl] = useState(
    decodeURIComponent(params[EXPERIMENT_URL_PARAMS_KEY] as string)
  );
  const [isVisualEditorEnabled, setIsEnabled] = useState(false);
  const [mode, setMode] = useState<ToolbarMode>("selection");
  const [variations, setVariations] = useState<VisualEditorVariation[]>([]);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [selectedVariationIndex, setSelectedVariationIndex] =
    useState<number>(variationIndex);
  const [highlightedElementSelector, setHighlightedElementSelector] = useState<
    string | null
  >(null);
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    rightAligned: true,
  });
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [apiCreds, setApiCreds] = useState<APICreds>({});
  const { fetchVisualChangeset, updateVisualChangeset } = useApi(apiCreds);
  const [showApiCredsAlert, setShowApiCredsAlert] = useState(false);

  const mutateRevert = useRef<(() => void) | null>(null);

  const selectedVariation = variations?.[selectedVariationIndex] ?? null;

  // generate a style tag to hold the global CSS
  const globalStyleTag = useMemo(() => {
    if (_globalStyleTag) document.head.removeChild(_globalStyleTag);
    _globalStyleTag = document.createElement("style");
    document.head.appendChild(_globalStyleTag);
    _globalStyleTag.innerHTML = selectedVariation?.css ?? "";
    return _globalStyleTag;
  }, [selectedVariation]);

  const updateSelectedVariation = useCallback(
    (updates: Partial<VisualEditorVariation>) => {
      const updatedVariation = {
        ...variations[selectedVariationIndex],
        ...updates,
      };

      const newVariations = [
        ...(variations?.map((v, i) =>
          i === selectedVariationIndex ? updatedVariation : v
        ) ?? []),
      ];

      setVariations(newVariations);

      if (!updateVisualChangeset) return;

      updateVisualChangeset(visualChangesetId, newVariations);
    },
    [
      variations,
      selectedVariation,
      setVariations,
      selectedVariationIndex,
      visualChangesetId,
      updateVisualChangeset,
    ]
  );

  const addDomMutations = useCallback(
    (domMutations: DeclarativeMutation[]) => {
      updateSelectedVariation({
        domMutations: [...selectedVariation.domMutations, ...domMutations],
      });
    },
    [updateSelectedVariation, selectedVariation]
  );

  const addDomMutation = useCallback(
    (domMutation: DeclarativeMutation) => {
      addDomMutations([domMutation]);
    },
    [addDomMutations]
  );

  const setGlobalCSS = useCallback(
    (css: string) => {
      updateSelectedVariation({ css });
      globalStyleTag.innerHTML = css;
    },
    [updateSelectedVariation]
  );

  // the generated selector of the currently selected element
  const selector = useMemo(
    () => (selectedElement ? getSelector(selectedElement) : ""),
    [selectedElement]
  );

  // the dom mutations that apply to the currently selected element
  const selectedElementMutations = useMemo(
    () =>
      selectedVariation?.domMutations.filter((m) =>
        selectedElement && selector ? m.selector === selector : true
      ) ?? [],
    [selectedElement, selectedVariation, selector]
  );

  const addClassNames = useCallback(
    (classNames: string) => {
      if (!selector) return;
      addDomMutations(
        classNames.split(" ").map((className) => ({
          action: "append",
          attribute: "class",
          value: className,
          selector,
        }))
      );
    },
    [selectedElement, addDomMutations]
  );

  const removeClassNames = useCallback(
    (classNames: string) => {
      if (!selector) return;
      addDomMutation({
        action: "remove",
        attribute: "class",
        value: classNames,
        selector,
      });
    },
    [selectedElement, addDomMutation]
  );

  const removeDomMutation = useCallback(
    (domMutationIndex: number) => {
      updateSelectedVariation({
        domMutations: selectedVariation.domMutations.filter(
          (_mutation, i) => i !== domMutationIndex
        ),
      });
    },
    [updateSelectedVariation, selectedVariation]
  );

  const setAttributes = useCallback(
    (attrs: Attribute[]) => {
      if (!selectedElement) return;
      const existing = [...selectedElement.attributes];
      const removed = existing.filter(
        (e) =>
          !attrs.find((a) => a.name === e.name) &&
          !IGNORED_ATTRS.includes(e.name)
      );
      const changed = attrs.filter(
        (attr) => attr.value !== selectedElement.getAttribute(attr.name)
      );
      removed.forEach((attr) => {
        addDomMutation({
          action: "remove",
          attribute: attr.name,
          selector,
          value: attr.value,
        });
      });
      changed.forEach((attr) => {
        addDomMutation({
          action: selectedElement.hasAttribute(attr.name) ? "set" : "append",
          attribute: attr.name,
          selector,
          value: attr.value,
        });
      });
    },
    [selectedElement, addDomMutation]
  );

  // get ahold of api credentials. requires messaging the background script
  useEffect(() => {
    // add listener for response
    const onMsg = (event: MessageEvent<Message>) => {
      const data = event.data;
      const hasVisualEditorParams = visualChangesetId && variationIndex;

      if (data.type !== "GB_RESPONSE_API_CREDS") return;

      if (hasVisualEditorParams && (!data.apiKey || !data.apiHost)) {
        setShowApiCredsAlert(true);
      }

      if (
        data.type === "GB_RESPONSE_API_CREDS" &&
        data.apiKey &&
        data.apiHost
      ) {
        setApiCreds({
          apiKey: data.apiKey,
          apiHost: data.apiHost,
        });
      }
    };

    window.addEventListener("message", onMsg);

    // send message
    window.postMessage({ type: "GB_REQUEST_API_CREDS" }, "*");

    // cleanup
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // fetch visual changeset and experiment from api once we have credentials
  useEffect(() => {
    const { apiHost, apiKey } = apiCreds;

    if (!apiHost || !apiKey || !fetchVisualChangeset || !visualChangesetId)
      return;

    const load = async () => {
      const { visualChangeset, experiment } = await fetchVisualChangeset(
        visualChangesetId
      );

      // Visual editor will not load if we cannot load visual changeset
      if (!visualChangeset || !experiment) return;

      const visualEditorVariations = genVisualEditorVariations({
        experiment,
        visualChangeset,
      });

      setVariations(visualEditorVariations);

      // remove visual editor query param once loaded
      cleanUpParams(params);

      setIsEnabled(true);
    };

    load();
  }, [visualChangesetId, fetchVisualChangeset]);

  // handle mode selection
  useEffect(() => {
    toggleNormalMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "normal"
    );
    toggleSelectionMode({
      isEnabled: !isVisualEditorEnabled
        ? isVisualEditorEnabled
        : mode === "selection",
      selectedElement,
      setSelectedElement,
      setHighlightedElementSelector,
    });
    toggleCssMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "css"
    );
    toggleMutationMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "mutation"
    );
    toggleScreenshotMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "screenshot"
    );
  }, [isVisualEditorEnabled, mode]);

  // selection mode - update on select
  useEffect(() => {
    if (!isVisualEditorEnabled) return;
    if (mode !== "selection") return;

    updateSelectedElement({
      selectedElement,
      setSelectedElement,
      setHighlightedElementSelector,
    });
  }, [
    selectedElement,
    setSelectedElement,
    setHighlightedElementSelector,
    isVisualEditorEnabled,
    mode,
  ]);

  // upon every DOM mutation, we revert all changes and replay them to ensure
  // that the DOM is in the correct state
  useEffect(() => {
    if (mutateRevert?.current) mutateRevert.current();

    const revertCallbacks: Array<() => void> = [];

    selectedVariation?.domMutations.forEach((mutation) => {
      const controller = mutate.declarative(mutation);
      revertCallbacks.push(controller.revert);
    });

    mutateRevert.current = () => {
      revertCallbacks.reverse().forEach((c) => c());
    };
  }, [variations, selectedVariation]);

  // Upon any DOM change on the page, we trigger a refresh of visual editor to
  // keep it in sync
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTimeout(() => forceUpdate(), 0)
    );

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  if (showApiCredsAlert) {
    return <SetApiCredsAlert />;
  }

  if (!isVisualEditorEnabled) return null;

  return (
    <VisualEditorPane style={parentStyles}>
      <VisualEditorHeader reverseX x={x} y={y} setX={setX} setY={setY} />

      <VariationSelector
        variations={variations}
        selectedVariationIndex={selectedVariationIndex}
        setSelectedVariationIndex={setSelectedVariationIndex}
      />

      <Toolbar mode={mode} setMode={setMode} />

      {mode === "selection" && selectedElement ? (
        <>
          <VisualEditorSection
            title="Breadcrumbs"
            onClose={() => setSelectedElement(null)}
          >
            <BreadcrumbsView
              element={selectedElement}
              setElement={setSelectedElement}
            />
          </VisualEditorSection>

          <VisualEditorSection title="Element Details">
            <ElementDetails
              selector={selector}
              element={selectedElement}
              addMutation={addDomMutation}
              addMutations={addDomMutations}
            />
          </VisualEditorSection>

          <VisualEditorSection title="Attributes">
            <AttributeEdit element={selectedElement} onSave={setAttributes} />
          </VisualEditorSection>

          <VisualEditorSection title="Class names">
            <ClassNamesEdit
              element={selectedElement}
              onRemove={removeClassNames}
              onAdd={addClassNames}
            />
          </VisualEditorSection>
        </>
      ) : null}

      {mode === "selection" ? (
        <HighlightedElementSelectorDisplay
          selector={highlightedElementSelector}
        />
      ) : null}

      {mode === "css" && (
        <VisualEditorSection title="Global CSS">
          <GlobalCSSEditor css={selectedVariation.css} setCss={setGlobalCSS} />
        </VisualEditorSection>
      )}

      {mode === "mutation" && (
        <VisualEditorSection title="DOM Mutation Editor">
          <DOMMutationEditor addMutation={addDomMutation} />
        </VisualEditorSection>
      )}

      {mode === "selection" && selectedElement && (
        <VisualEditorSection
          isCollapsible
          title={`Changes (${selectedElementMutations.length})`}
        >
          <DOMMutationList mutations={selectedElementMutations ?? []} />
        </VisualEditorSection>
      )}

      {mode === "changes" && (
        <VisualEditorSection
          isCollapsible
          isExpanded
          title={`Changes (${selectedVariation?.domMutations.length})`}
        >
          <DOMMutationList
            removeDomMutation={removeDomMutation}
            mutations={selectedVariation?.domMutations ?? []}
          />
        </VisualEditorSection>
      )}

      <div className="m-4">
        <button
          className="w-full p-2 bg-indigo-800 rounded text-white font-semibold text-lg"
          onClick={() => (window.location.href = experimentUrl)}
        >
          Done Editing
        </button>
      </div>
    </VisualEditorPane>
  );
};

// mounting the visual editor
export const CONTAINER_ID = "__gb_visual_editor";

const container = document.createElement("div");
container.id = CONTAINER_ID;

export const shadowRoot = container?.attachShadow({ mode: "open" });

if (shadowRoot) {
  shadowRoot.innerHTML = `
    <style>${VisualEditorCss}</style>
    <div id="visual-editor-root"></div>
  `;
}

document.body.appendChild(container);

const root = ReactDOM.createRoot(
  shadowRoot.querySelector("#visual-editor-root")!
);

root.render(
  <React.StrictMode>
    <VisualEditor />
  </React.StrictMode>
);
