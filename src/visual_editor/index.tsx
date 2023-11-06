import { debounce } from "lodash";
import React, {
  FC,
  useCallback,
  useEffect,
  useReducer,
  useState,
  useMemo,
  useRef,
} from "react";
import * as ReactDOM from "react-dom/client";

import { ErrorCode, VisualEditorVariation } from "../../devtools";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";
import useQueryParams from "./lib/hooks/useQueryParams";
import useVisualChangeset from "./lib/hooks/useVisualChangeset";
import useAiCopySuggestion from "./lib/hooks/useAiCopySuggestion";
import useGlobalCSS from "./lib/hooks/useGlobalCSS";
import useCustomJs from "./lib/hooks/useCustomJs";
import useEditMode from "./lib/hooks/useEditMode";
import useDragAndDrop from "./lib/hooks/useDragAndDrop";

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
import AttributeEdit from "./components/AttributeEdit";
import CustomJSEditor from "./components/CustomJSEditor";
import CSSAttributeEditor from "./components/CSSAttributeEditor";
import ReloadPageButton from "./components/ReloadPageButton";
import ErrorDisplay from "./components/ErrorDisplay";
import BackToGBButton from "./components/BackToGBButton";
import AIEditorSection from "./components/AIEditorSection";
import AICopySuggestor from "./components/AICopySuggestor";
import FloatingUndoButton from "./components/FloatingUndoButton";
import MoveElementHandle from "./components/MoveElementHandle";
import SDKWarning from "./components/SDKWarning";
import DebugPanel from "./components/DebugPanel";

import VisualEditorCss from "./shadowDom.css";
import "./targetPage.css";

const VisualEditor: FC<{}> = () => {
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    rightAligned: true,
  });

  const {
    params,
    visualChangesetId,
    variationIndex,
    hasAiEnabled,
    cleanUpParams,
  } = useQueryParams();

  const {
    error,
    cspError,
    variations,
    updateVariationAtIndex,
    experimentUrl,
    experiment,
    visualChangeset,
  } = useVisualChangeset(visualChangesetId);

  const {
    loading: aiLoading,
    error: aiError,
    transformCopy,
    transformedCopy,
  } = useAiCopySuggestion(visualChangesetId);

  const [selectedVariationIndex, setSelectedVariationIndex] =
    useState<number>(variationIndex);

  const selectedVariation = variations?.[selectedVariationIndex] ?? null;

  const updateSelectedVariation = useCallback(
    (updates: Partial<VisualEditorVariation>) => {
      updateVariationAtIndex(selectedVariationIndex, updates);
    },
    [selectedVariationIndex, updateVariationAtIndex]
  );

  const { globalCss, setGlobalCss } = useGlobalCSS({
    variation: selectedVariation,
    updateVariation: updateSelectedVariation,
  });

  const { customJs, setCustomJs, customJsError } = useCustomJs({
    variation: selectedVariation,
    updateVariation: updateSelectedVariation,
  });

  const [mode, setMode] = useState<VisualEditorMode | null>(null);

  const {
    elementUnderEdit,
    setElementUnderEdit,
    clearElementUnderEdit,
    elementUnderEditSelector,
    elementUnderEditCopy,
    highlightedElement,
    setInnerHTML,
    undoInnerHTMLMutations,
    setHTMLAttributes,
    addClassNames,
    removeClassNames,
    setCSS,
    elementUnderEditMutations,
    addDomMutation,
    removeDomMutation,
    setDomMutations,
  } = useEditMode({
    isEnabled: mode === "edit",
    variation: selectedVariation,
    updateVariation: updateSelectedVariation,
  });

  const moveHandleRef = useRef<HTMLDivElement | null>(null);

  const { isDragging } = useDragAndDrop({
    isEnabled: mode === "edit",
    elementToDrag: elementUnderEdit,
    addDomMutation,
    elementUnderEditMutations,
    setDomMutations,
    moveHandleRef,
  });

  const selectedVariationTotalChangesLength = useMemo(
    () =>
      (selectedVariation?.domMutations ?? []).length +
      (selectedVariation?.js ? 1 : 0) +
      (selectedVariation?.css ? 1 : 0),
    [selectedVariation]
  );

  useEffect(() => {
    if (!variations.length) return;
    if (mode === null) setMode("edit");
    cleanUpParams();
  }, [variations]);

  // Upon any DOM change on the page, we trigger a refresh of visual editor to
  // keep it in sync. We use debounce to limit forceUpdate calls to 1 per 100ms.
  const [, _forceUpdate] = useReducer((x) => x + 1, 0);
  const forceUpdate = debounce(_forceUpdate, 100);

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
          clearSelectedElement={clearElementUnderEdit}
        />

        {mode === "edit" && elementUnderEdit ? (
          <>
            <VisualEditorSection title="Breadcrumbs">
              <BreadcrumbsView
                element={elementUnderEdit}
                setElement={setElementUnderEdit}
              />
            </VisualEditorSection>

            <VisualEditorSection title="Element Details">
              <ElementDetails
                selector={elementUnderEditSelector}
                element={elementUnderEdit}
                setHTML={setInnerHTML}
                undoHTMLMutations={undoInnerHTMLMutations}
              />
            </VisualEditorSection>

            <AIEditorSection
              isVisible={hasAiEnabled && !!elementUnderEditCopy.length}
            >
              <AICopySuggestor
                loading={aiLoading}
                parentElement={elementUnderEdit}
                setHTML={setInnerHTML}
                copy={elementUnderEditCopy}
                transformCopy={transformCopy}
                transformedCopy={transformedCopy}
              />
            </AIEditorSection>

            <VisualEditorSection title="Attributes">
              <AttributeEdit
                element={elementUnderEdit}
                onSave={setHTMLAttributes}
              />
            </VisualEditorSection>

            {/** SVGs do not work with class name editor ATM; See issue GB-194 **/}
            {!["svg", "path"].includes(elementUnderEdit.tagName) && (
              <VisualEditorSection title="Class names">
                <ClassNamesEdit
                  element={elementUnderEdit}
                  onRemove={removeClassNames}
                  onAdd={addClassNames}
                />
              </VisualEditorSection>
            )}

            <VisualEditorSection isCollapsible title={`CSS attributes`}>
              <CSSAttributeEditor
                selectedElement={elementUnderEdit}
                setCSS={setCSS}
              />
            </VisualEditorSection>

            <VisualEditorSection
              isCollapsible
              title={`Changes (${elementUnderEditMutations.length})`}
            >
              <DOMMutationList
                mutations={elementUnderEditMutations ?? []}
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

        {mode === "debug" && (
          <VisualEditorSection title="Debug panel">
            <DebugPanel
              experiment={experiment}
              visualChangeset={visualChangeset}
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
          <SDKWarning />
        </div>
      </VisualEditorPane>

      {/** Overlays for highlighting selected elements **/}
      {mode === "edit" && elementUnderEdit && !isDragging ? (
        <>
          <FloatingFrame
            hideOverlay={isDragging}
            parentElement={elementUnderEdit}
            clearSelectedElement={() => setElementUnderEdit(null)}
          />
          <SelectorDisplay parentElement={elementUnderEdit} />
          {elementUnderEditMutations.length > 0 ? (
            <FloatingUndoButton
              parentElement={elementUnderEdit}
              undo={() =>
                removeDomMutation(elementUnderEditMutations.slice(-1)[0])
              }
            />
          ) : null}
        </>
      ) : null}
      {mode === "edit" && elementUnderEdit ? (
        <MoveElementHandle
          ref={moveHandleRef}
          parentElement={elementUnderEdit}
        />
      ) : null}
      {/** Overlays for highlighting hovered elements **/}
      {mode === "edit" && !isDragging ? (
        <>
          <FloatingFrame parentElement={highlightedElement} />
          <SelectorDisplay parentElement={highlightedElement} />
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

root.render(<VisualEditor />);
