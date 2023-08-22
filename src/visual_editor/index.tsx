import mutate, { DeclarativeMutation } from "dom-mutator";
import { debounce } from "lodash";
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

import { ErrorCode, VisualEditorVariation } from "../../devtools";
import {
  toggleSelectionMode,
  onSelectionModeUpdate,
} from "./lib/selectionMode";
import getSelector from "./lib/getSelector";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";
import useQueryParams from "./lib/hooks/useQueryParams";
import useGlobalCSS from "./lib/hooks/useGlobalCSS";
import useCustomJs from "./lib/hooks/useCustomJs";
import getHumanReadableText from "./lib/getHumanReadableText";
import useVisualChangeset from "./lib/hooks/useVisualChangeset";
import useAiCopySuggestion from "./lib/hooks/useAiCopySuggestion";

import Toolbar, { VisualEditorMode } from "./components/Toolbar";
import ElementDetails from "./components/ElementDetails";
import SelectorDisplay from "./components/SelectorDisplay";
import FloatingFrame from "./components/FloatingFrame";
import GlobalCSSEditor from "./components/GlobalCSSEditor";
import VisualEditorPane from "./components/VisualEditorPane";
import VisualEditorSection from "./components/VisualEditorSection";
import BreadcrumbsView from "./components/BreadcrumbsView";
import ClassNamesEdit from "./components/ClassNamesEdit";
import DOMMutationList from "./components/DOMMutationList";
import VariationSelector from "./components/VariationSelector";
import VisualEditorHeader from "./components/VisualEditorHeader";
import AttributeEdit, {
  Attribute,
  IGNORED_ATTRS,
} from "./components/AttributeEdit";
import CustomJSEditor from "./components/CustomJSEditor";
import CSSAttributeEditor from "./components/CSSAttributeEditor";
import ReloadPageButton from "./components/ReloadPageButton";
import ErrorDisplay from "./components/ErrorDisplay";
import BackToGBButton from "./components/BackToGBButton";
import AIEditorSection from "./components/AIEditorSection";
import AICopySuggestor from "./components/AICopySuggestor";

import VisualEditorCss from "./shadowDom.css";
import "./targetPage.css";

const VisualEditor: FC<{}> = () => {
  const {
    params,
    visualChangesetId,
    variationIndex,
    hasAiEnabled,
    cleanUpParams,
  } = useQueryParams();
  const { error, cspError, variations, updateVariationAtIndex, experimentUrl } =
    useVisualChangeset(visualChangesetId);
  const {
    loading: aiLoading,
    error: aiError,
    transformCopy,
    transformedCopy,
  } = useAiCopySuggestion(visualChangesetId);
  const [selectedVariationIndex, setSelectedVariationIndex] =
    useState<number>(variationIndex);
  const updateSelectedVariation = useCallback(
    (updates: Partial<VisualEditorVariation>) => {
      updateVariationAtIndex(selectedVariationIndex, updates);
    },
    [selectedVariationIndex, updateVariationAtIndex]
  );
  const selectedVariation = variations?.[selectedVariationIndex] ?? null;
  const { globalCss, setGlobalCss } = useGlobalCSS({
    variation: selectedVariation,
    updateVariation: updateSelectedVariation,
  });
  const { customJs, setCustomJs, customJsError } = useCustomJs({
    variation: selectedVariation,
    updateVariation: updateSelectedVariation,
  });
  // used to allow moving the floating frame around
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    rightAligned: true,
  });

  const [mode, setMode] = useState<VisualEditorMode | null>(null);

  /** TODO useSelectionMode or useEditingMode */

  /**
   * const {
   *   selectedElement,
   *   highlightedElement,
   *   addDomMutations,
   *   removeDomMutations,
   *   addClassNamesToSelectedElement,
   *   removeClassNamesFromSelectedElement,
   *   setAttributesForSelectedElement,
   *   setCSSForSelectedElement,
   *   setHTMLForSelectedElement,
   *   undoHTMLMutations,
   *   selectedElementMutations,
   * } = useEditingMode(mode === 'selection');
   */

  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [highlightedElementSelector, setHighlightedElementSelector] = useState<
    string | null
  >(null);

  const highlightedElement = useMemo(() => {
    if (!highlightedElementSelector) return null;
    return document.querySelector(highlightedElementSelector);
  }, [highlightedElementSelector]);

  const mutateRevert = useRef<(() => void) | null>(null);

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

  // the generated selector of the currently selected element
  const selector = useMemo(
    () => (selectedElement ? getSelector(selectedElement) : ""),
    [selectedElement]
  );

  const setHTML = useCallback(
    (html: string) => {
      addDomMutation({
        action: "set",
        attribute: "html",
        value: html,
        selector,
      });
    },
    [selector, addDomMutation]
  );

  const undoHTMLMutations = useMemo(() => {
    const htmlMutations = (selectedVariation?.domMutations ?? []).filter(
      (mutation) =>
        mutation.attribute === "html" && mutation.selector === selector
    );
    if (htmlMutations.length === 0) return;
    return () => {
      removeDomMutations(htmlMutations);
    };
  }, [selectedVariation, selector]);

  // the dom mutations that apply to the currently selected element
  const selectedElementMutations = useMemo(
    () =>
      selectedVariation?.domMutations.filter((m) =>
        selectedElement && selector ? m.selector === selector : true
      ) ?? [],
    [selectedElement, selectedVariation, selector]
  );

  const selectedVariationTotalChangesLength = useMemo(
    () =>
      (selectedVariation?.domMutations ?? []).length +
      (selectedVariation?.js ? 1 : 0) +
      (selectedVariation?.css ? 1 : 0),
    [selectedVariation]
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
    (mutation: DeclarativeMutation) => {
      updateSelectedVariation({
        domMutations: selectedVariation.domMutations.filter(
          (m) => mutation !== m
        ),
      });
    },
    [updateSelectedVariation, selectedVariation]
  );

  const removeDomMutations = useCallback(
    (mutations: DeclarativeMutation[]) => {
      updateSelectedVariation({
        domMutations: selectedVariation.domMutations.filter(
          (m) => !mutations.includes(m)
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

  const setCSS = useCallback(
    (css: string) => {
      if (!selector) return;
      addDomMutation({
        action: "set",
        attribute: "style",
        value: css,
        selector,
      });
    },
    [selector, addDomMutation]
  );

  const humanReadableText = useMemo(() => {
    if (!selectedElement) return "";
    return getHumanReadableText(selectedElement);
  }, [getHumanReadableText, selectedElement, selectedElement?.innerHTML]);

  const selectedElementHasCopy = useMemo(
    () => humanReadableText.length > 0,
    [humanReadableText]
  );

  // forceUpdate is used to force a re-render of the component
  const [, _forceUpdate] = useReducer((x) => x + 1, 0);
  // limit the forceUpdate calls to 1 per 100ms
  const forceUpdate = debounce(_forceUpdate, 100);

  useEffect(() => {
    if (!variations.length) return;
    if (mode === null) setMode("selection");
    cleanUpParams();
  }, [variations]);

  // handle mode selection
  useEffect(() => {
    toggleSelectionMode({
      isEnabled: mode === "selection",
      selectedElement,
      setSelectedElement,
      setHighlightedElementSelector,
      addDomMutation,
    });
  }, [mode]);

  // selection mode - update on select
  useEffect(() => {
    if (mode !== "selection") return;

    onSelectionModeUpdate({
      selectedElement,
      setSelectedElement,
      setHighlightedElementSelector,
      addDomMutation,
    });
  }, [
    selectedElement,
    setSelectedElement,
    setHighlightedElementSelector,
    mode,
  ]);

  // upon every DOM mutation, we revert all changes and replay them to ensure
  // that the DOM is in the correct state
  useEffect(() => {
    // run reverts if they exist
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

  return (
    <>
      <VisualEditorPane style={parentStyles}>
        <VisualEditorHeader reverseX x={x} y={y} setX={setX} setY={setY} />

        <VariationSelector
          variations={variations}
          selectedVariationIndex={selectedVariationIndex}
          setSelectedVariationIndex={setSelectedVariationIndex}
        />

        <Toolbar
          disabled={!variations.length}
          mode={mode}
          setMode={setMode}
          clearSelectedElement={() => setSelectedElement(null)}
        />

        {mode === "selection" && selectedElement ? (
          <>
            <VisualEditorSection title="Breadcrumbs">
              <BreadcrumbsView
                element={selectedElement}
                setElement={setSelectedElement}
              />
            </VisualEditorSection>

            <VisualEditorSection title="Element Details">
              <ElementDetails
                selector={selector}
                element={selectedElement}
                setHTML={setHTML}
                undoHTMLMutations={undoHTMLMutations}
              />
            </VisualEditorSection>

            <AIEditorSection isVisible={hasAiEnabled && selectedElementHasCopy}>
              <AICopySuggestor
                loading={aiLoading}
                parentElement={selectedElement}
                setHTML={setHTML}
                copy={humanReadableText}
                transformCopy={transformCopy}
                transformedCopy={transformedCopy}
              />
            </AIEditorSection>

            <VisualEditorSection title="Attributes">
              <AttributeEdit element={selectedElement} onSave={setAttributes} />
            </VisualEditorSection>

            {/** SVGs do not work with class name editor ATM; See issue GB-194 **/}
            {!["svg", "path"].includes(selectedElement.tagName) && (
              <VisualEditorSection title="Class names">
                <ClassNamesEdit
                  element={selectedElement}
                  onRemove={removeClassNames}
                  onAdd={addClassNames}
                />
              </VisualEditorSection>
            )}

            <VisualEditorSection isCollapsible title={`CSS attributes`}>
              <CSSAttributeEditor
                selectedElement={selectedElement}
                setCSS={setCSS}
              />
            </VisualEditorSection>

            <VisualEditorSection
              isCollapsible
              title={`Changes (${selectedElementMutations.length})`}
            >
              <DOMMutationList
                mutations={selectedElementMutations ?? []}
                removeDomMutation={removeDomMutation}
              />
            </VisualEditorSection>
          </>
        ) : null}

        {mode === "js" && (
          <VisualEditorSection title="Custom JS">
            <CustomJSEditor js={customJs} onSubmit={setCustomJs} />
            {customJsError && (
              <div className="gb-px-4 gb-py-2 gb-text-rose-500">
                JS error: {customJsError}
              </div>
            )}
          </VisualEditorSection>
        )}

        {mode === "css" && (
          <VisualEditorSection title="Global CSS">
            <GlobalCSSEditor css={globalCss} onSubmit={setGlobalCss} />
          </VisualEditorSection>
        )}

        {mode === "changes" && (
          <VisualEditorSection
            isCollapsible
            isExpanded
            title={`Changes (${selectedVariationTotalChangesLength})`}
          >
            <DOMMutationList
              addMutation={addDomMutation}
              globalCss={globalCss}
              clearGlobalCss={() => setGlobalCss("")}
              customJs={customJs}
              clearCustomJs={() => setCustomJs("")}
              removeDomMutation={removeDomMutation}
              mutations={selectedVariation?.domMutations ?? []}
            />
          </VisualEditorSection>
        )}

        {error || aiError ? (
          <ErrorDisplay
            error={(error || aiError) as ErrorCode}
            cspError={cspError}
          />
        ) : null}

        <div className="gb-m-4 gb-text-center">
          <BackToGBButton experimentUrl={experimentUrl} />
          <ReloadPageButton
            params={params}
            variationIndex={variationIndex}
            visualChangesetId={visualChangesetId}
            hasAiEnabled={hasAiEnabled}
          />
        </div>
      </VisualEditorPane>

      {/** Overlays for highlighting selected elements **/}
      {mode === "selection" && selectedElement ? (
        <>
          <FloatingFrame
            parentElement={selectedElement}
            clearSelectedElement={() => setSelectedElement(null)}
          />
          <SelectorDisplay selector={selector} />
        </>
      ) : null}
      {/** Overlays for highlighting hovered elements **/}
      {mode === "selection" ? (
        <>
          <FloatingFrame parentElement={highlightedElement} />
          <SelectorDisplay selector={highlightedElementSelector} />
        </>
      ) : null}
    </>
  );
};

/**
 * mounting the visual editor
 */
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
