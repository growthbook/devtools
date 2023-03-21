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

const VISUAL_CHANGESET_ID_PARAMS_KEY = "vc-id";
const VARIATION_INDEX_PARAMS_KEY = "v-idx";

// TODO
type APIExperiment = any;
type APIVisualChangeset = any;

export interface VisualEditorVariation {
  id: string;
  name: string;
  description: string;
  css?: string;
  domMutations: DeclarativeMutation[];
}

let _globalStyleTag: HTMLStyleElement | null = null;

const genVisualEditorVariations = ({
  experiment,
  visualChangeset,
}: {
  experiment: APIExperiment;
  visualChangeset: APIVisualChangeset;
}): VisualEditorVariation[] => {
  const { variations } = experiment;
  const { visualChanges } = visualChangeset;
  return variations.map((variation: any, index: number) => {
    const { css = "", domMutations = [] } = visualChanges[index] ?? {};
    return {
      id: variation.id,
      name: variation.name,
      description: variation.description,
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
      },
    })
  );
};

const VisualEditor: FC<{}> = () => {
  const params = qs.parse(window.location.search);
  const visualChangesetId = params[VISUAL_CHANGESET_ID_PARAMS_KEY] as string;
  const variationIndex = getVariationIndexFromParams(
    params[VARIATION_INDEX_PARAMS_KEY]
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
  const [apiCreds, setApiCreds] = useState<{
    apiKey?: string;
    apiHost?: string;
  }>({});

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
      setVariations([
        ...(variations?.map((variation, index) => {
          if (index === selectedVariationIndex) {
            return {
              ...variation,
              ...updates,
            };
          }
          return variation;
        }) ?? []),
      ]);
    },
    [variations, selectedVariation, setVariations, selectedVariationIndex]
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
    [selectedVariation, selector]
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

  // get ahold of api credentials. requires messaging the background script
  useEffect(() => {
    // add listener for response
    const onMsg = (event: MessageEvent<Message>) => {
      const data = event.data;
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

    if (!visualChangesetId) return;
    if (!apiHost || !apiKey) return;

    const fetchVisualChangeset = async () => {
      const response = await fetch(
        `${apiHost}/api/v1/visual-changesets/${visualChangesetId}?includeExperiment=1`,
        {
          headers: {
            Authorization: `Basic ${btoa(apiKey + ":")}`,
          },
        }
      );

      const res = await response.json();
      const { visualChangeset, experiment } = res;

      // Visual editor will not load if we cannot load visual changeset
      if (!visualChangeset) return;

      const visualEditorVariations = genVisualEditorVariations({
        experiment,
        visualChangeset,
      });

      setVariations(visualEditorVariations);

      // remove visual editor query param once loaded
      cleanUpParams(params);

      setIsEnabled(true);
    };

    fetchVisualChangeset();
  }, [visualChangesetId, apiCreds]);

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
              setElement={setSelectedElement}
              addMutation={addDomMutation}
              addMutations={addDomMutations}
            />
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
          <DOMMutationList
            removeDomMutation={removeDomMutation}
            mutations={selectedElementMutations ?? []}
          />
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
