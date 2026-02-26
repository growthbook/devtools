import { debounce } from "lodash";
import React, {
  Component,
  ErrorInfo,
  FC,
  useCallback,
  useEffect,
  useReducer,
  useState,
  useMemo,
  useRef,
} from "react";
import * as ReactDOM from "react-dom/client";

import { VisualEditorVariation } from "devtools";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";
import useQueryParams from "./lib/hooks/useQueryParams";
import useVisualChangeset from "./lib/hooks/useVisualChangeset";
import useAiCopySuggestion from "./lib/hooks/useAiCopySuggestion";
import useGlobalCSS from "./lib/hooks/useGlobalCSS";
import useCustomJs from "./lib/hooks/useCustomJs";
import useEditMode from "./lib/hooks/useEditMode";
import useDragAndDrop from "./lib/hooks/useDragAndDrop";
import useSDKDiagnostics from "./lib/hooks/useSDKDiagnostics";

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
import DebugPanel from "./components/DebugPanel";

import VisualEditorCss from "./shadowDom.css";
import "./targetPage.css";
import { isGlobalObserverPaused } from "dom-mutator";

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

  const { hasSDK, hasLatest, version, hashAttribute, hasHashAttribute } =
    useSDKDiagnostics({
      experiment,
    });

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
    [selectedVariationIndex, updateVariationAtIndex],
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
    ignoreClassNames,
    setIgnoreClassNames,
    stopInlineEditing,
    resetAndStopInlineEditing,
    isInlineEditing,
  } = useEditMode({
    isEnabled: mode === "edit",
    variation: selectedVariation,
    updateVariation: updateSelectedVariation,
  });

  const moveHandleRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setDragging] = useState(false);

  const { isDragging: draggingStarted } = useDragAndDrop({
    isEnabled: mode === "edit" && !isInlineEditing,
    elementToDrag: isInlineEditing ? null : elementUnderEdit,
    addDomMutation,
    elementUnderEditMutations,
    setDomMutations,
    moveHandleRef,
    hasSDK,
    sdkVersion: version,
  });
  // wait for 1 second before setting dragging to true
  useEffect(() => {
    if (draggingStarted) {
      const timeout = setTimeout(() => {
        setDragging(true);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setDragging(false);
    }
  }, [draggingStarted]);

  const selectedVariationTotalChangesLength = useMemo(
    () =>
      (selectedVariation?.domMutations ?? []).length +
      (selectedVariation?.js ? 1 : 0) +
      (selectedVariation?.css ? 1 : 0),
    [selectedVariation],
  );
  const issueError = error || aiError;
  const hasNonFatalCspWarning = !!cspError && !cspError.isFatal && !issueError;
  const hasIssues = !!issueError || !!cspError;
  const issuesCount = (issueError ? 1 : 0) + (cspError ? 1 : 0);

  useEffect(() => {
    if (!variations.length) return;
    if (mode === null) setMode("edit");
    cleanUpParams();
  }, [variations]);

  // Upon any DOM change on the page, we trigger a refresh of visual editor to
  // keep it in sync. We use debounce to limit forceUpdate calls to 1 per 100ms.
  const [, _forceUpdate] = useReducer((x) => x + 1, 0);
  const forceUpdate = debounce(() => _forceUpdate(), 100);

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTimeout(() => forceUpdate(), 0),
    );
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
    };
  }, []);
  //reset inline editing when mode changes
  useEffect(() => {
    resetAndStopInlineEditing();
  }, [mode]);
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
                ignoreClassNames={ignoreClassNames}
                setIgnoreClassNames={setIgnoreClassNames}
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
              <div className="px-4 py-2 text-rose-500">
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
              hasSDK={hasSDK}
              hasLatest={hasLatest}
              sdkVersion={version}
              hashAttribute={hashAttribute}
              hasHashAttribute={hasHashAttribute}
            />
          </VisualEditorSection>
        )}

        {hasIssues ? (
          <VisualEditorSection
            title={`Issues (${issuesCount})`}
            isCollapsible
            isExpanded={!hasNonFatalCspWarning}
          >
            <ErrorDisplay error={issueError} cspError={cspError} />
          </VisualEditorSection>
        ) : null}

        <div className="m-4 text-center">
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
      {mode === "edit" && elementUnderEdit && !isDragging ? (
        <>
          <FloatingFrame
            hideOverlay={isDragging}
            parentElement={elementUnderEdit}
            clearSelectedElement={() => {
              stopInlineEditing();
            }}
          />
          {!elementUnderEdit && (
            <SelectorDisplay parentElement={elementUnderEdit} />
          )}
          {elementUnderEditMutations.length > 0 && !!elementUnderEdit ? (
            <FloatingUndoButton
              parentElement={elementUnderEdit}
              undo={() => {
                const lastMutation =
                  elementUnderEditMutations[
                    elementUnderEditMutations.length - 1
                  ];
                if (lastMutation.value === elementUnderEdit.innerHTML) {
                  removeDomMutation(lastMutation);
                }
                if (isGlobalObserverPaused()) {
                  resetAndStopInlineEditing();
                }
              }}
            />
          ) : null}
        </>
      ) : null}
      {mode === "edit" && elementUnderEdit && !isInlineEditing ? (
        <MoveElementHandle
          ref={moveHandleRef}
          parentElement={elementUnderEdit}
          onPointerDown={() => stopInlineEditing()}
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

type VisualEditorErrorBoundaryProps = {
  onRetry: () => void;
  children: React.ReactNode;
};
type VisualEditorErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class VisualEditorErrorBoundary extends Component<
  VisualEditorErrorBoundaryProps,
  VisualEditorErrorBoundaryState
> {
  state: VisualEditorErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    window.postMessage(
      {
        type: "GB_ERROR",
        error: `visual-editor-crash: ${error?.message || "Unknown error"}; ${info.componentStack || ""}`,
      },
      window.location.origin,
    );
  }

  private retry = () => {
    this.setState({ hasError: false, message: "" });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl shadow-xl z-max w-80 bg-dark p-4 text-red-400">
          <p className="text-sm mb-2">Visual Editor hit a runtime error.</p>
          <p className="text-xs mb-3 break-words">{this.state.message}</p>
          <button
            className="bg-slate-600 text-slate-100 px-3 py-1 rounded text-xs"
            onClick={this.retry}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * mounting the visual editor
 */
export const CONTAINER_ID = "__gb_visual_editor";

export let shadowRoot: ShadowRoot | null = null;
let root: ReactDOM.Root | null = null;
let mountObserver: MutationObserver | null = null;
let remountTimeout: number | null = null;
let remountCount = 0;
let remountWindowStart = 0;
const REMOUNT_WINDOW_MS = 10000;
const MAX_REMOUNTS_PER_WINDOW = 5;

const isNodeAttached = (node: Node | null) =>
  !!node && document.documentElement.contains(node);

const scheduleRemount = () => {
  const now = Date.now();
  if (now - remountWindowStart > REMOUNT_WINDOW_MS) {
    remountWindowStart = now;
    remountCount = 0;
  }
  if (remountCount >= MAX_REMOUNTS_PER_WINDOW) return;
  remountCount += 1;

  if (remountTimeout) window.clearTimeout(remountTimeout);
  remountTimeout = window.setTimeout(() => {
    ensureVisualEditorMounted();
  }, 150);
};

const getContainer = () =>
  document.getElementById(CONTAINER_ID) as HTMLDivElement | null;

const ensureVisualEditorMounted = () => {
  let container = getContainer();
  if (!container || !isNodeAttached(container)) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
  }

  if (!container.shadowRoot) {
    shadowRoot = container.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <style>${VisualEditorCss}</style>
      <div id="visual-editor-root"></div>
    `;
    root = null;
  } else {
    shadowRoot = container.shadowRoot;
    if (!shadowRoot.querySelector("#visual-editor-root")) {
      shadowRoot.innerHTML = `
        <style>${VisualEditorCss}</style>
        <div id="visual-editor-root"></div>
      `;
      root = null;
    }
  }

  const mountNode = shadowRoot?.querySelector("#visual-editor-root");
  if (!mountNode) return;

  if (!root) {
    root = ReactDOM.createRoot(mountNode);
  }
  root.render(
    <VisualEditorErrorBoundary onRetry={() => ensureVisualEditorMounted()}>
      <VisualEditor />
    </VisualEditorErrorBoundary>,
  );

  if (!mountObserver) {
    mountObserver = new MutationObserver(() => {
      const currentContainer = getContainer();
      if (!currentContainer || !isNodeAttached(currentContainer)) {
        scheduleRemount();
      }
    });
    mountObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
};

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    ensureVisualEditorMounted();
  }
});

window.addEventListener("pagehide", () => {
  if (remountTimeout) {
    window.clearTimeout(remountTimeout);
    remountTimeout = null;
  }
});

ensureVisualEditorMounted();
