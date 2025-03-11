import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Checkbox, Link, Switch } from "@radix-ui/themes";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import {
  PiArrowSquareInBold,
  PiArrowSquareOutBold,
  PiCaretRightFill,
  PiCheckBold,
  PiDownloadSimpleBold,
  PiLinkBold,
  PiUploadSimpleBold,
} from "react-icons/pi";
import useTabState, { getActiveTabId } from "@/app/hooks/useTabState";
import { Attributes } from "@growthbook/growthbook";
import { getOS } from "@/app/utils";
import clsx from "clsx";
import TextareaAutosize from "react-textarea-autosize";
import * as Accordion from "@radix-ui/react-accordion";

type StatePayload = {
  features?: Record<string, any>;
  experiments?: Record<string, number>;
  attributes?: Record<string, any>;
};

const ImportExport = ({ close }: { close: () => void }) => {
  const isDevtoolsPanel = useMemo(
    () =>
      document
        .querySelector("#root")
        ?.getAttribute("data-is-devtools-panel") === "1",
    [],
  );
  const isFirefox = navigator.userAgent.includes("Firefox");

  const [forcedFeatures, setForcedFeatures, forcedFeaturesReady] = useTabState<
    Record<string, any>
  >("forcedFeatures", {});
  const [forcedVariations, setForcedVariations, forcedVariationsReady] =
    useTabState<Record<string, any>>("forcedVariations", {});
  const [
    overriddenAttributes,
    setOverriddenAttributes,
    overriddenAttributesReady,
  ] = useTabState<Attributes>("overriddenAttributes", {});

  const [formValue, setFormValue] = useState("");
  const [textareaError, setTextareaError] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [imported, setImported] = useState(false);

  const numForcedFeatures = Object.keys(forcedFeatures || {}).length;
  const numForcedVariations = Object.keys(forcedVariations || {}).length;
  const numAttributeOverrides = Object.keys(overriddenAttributes || {}).length;

  const [includeFeatures, setIncludeFeatures] = useState(numForcedFeatures > 0);
  const [includeExperiments, setIncludeExperiments] = useState(
    numForcedVariations > 0,
  );
  const [includeAttributes, setIncludeAttributes] = useState(
    numAttributeOverrides > 0,
  );

  useEffect(() => {
    if (
      forcedFeaturesReady &&
      forcedVariationsReady &&
      overriddenAttributesReady
    ) {
      setIncludeFeatures(numForcedFeatures > 0);
      setIncludeExperiments(numForcedVariations > 0);
      setIncludeAttributes(numAttributeOverrides > 0);
    }
  }, [
    numForcedFeatures,
    numForcedVariations,
    numAttributeOverrides,
    forcedFeaturesReady,
    forcedVariationsReady,
    overriddenAttributesReady,
  ]);

  const statePayload = useMemo(() => {
    const payloadObj: StatePayload = {
      ...(includeFeatures ? { features: forcedFeatures } : {}),
      ...(includeExperiments ? { experiments: forcedVariations } : {}),
      ...(includeAttributes ? { attributes: overriddenAttributes } : {}),
    };
    return JSON.stringify(payloadObj);
  }, [
    includeFeatures,
    includeExperiments,
    includeAttributes,
    forcedFeatures,
    forcedVariations,
    overriddenAttributes,
  ]);

  const importState = async () => {
    try {
      const data = JSON.parse(formValue);
      if (data?.attributes && typeof data.attributes === "object") {
        setOverriddenAttributes(data.attributes);
      }
      if (data?.features && typeof data.features === "object") {
        setForcedFeatures(data.features);
      }
      if (data?.experiments && typeof data.experiments === "object") {
        setForcedVariations(data.experiments);
      }
      if (data?.payload && typeof data.payload === "object") {
        const activeTabId = await getActiveTabId();
        if (activeTabId) {
          if (chrome?.tabs) {
            await chrome.tabs.sendMessage(activeTabId, {
              type: "SET_PAYLOAD",
              data: data.payload,
            });
          } else {
            chrome.runtime.sendMessage({
              type: "SET_PAYLOAD",
              data: data.payload,
            });
          }
        }
      }
      if (data?.patchPayload && typeof data.patchPayload === "object") {
        const activeTabId = await getActiveTabId();
        if (activeTabId) {
          if (chrome?.tabs) {
            await chrome.tabs.sendMessage(activeTabId, {
              type: "PATCH_PAYLOAD",
              data: data.patchPayload,
            });
          } else {
            chrome.runtime.sendMessage({
              type: "PATCH_PAYLOAD",
              data: data.patchPayload,
            });
          }
        }
      }

      setTextareaError(false);
      setDirty(false);
      setFormValue("");
      setImported(true);
      setTimeout(() => setImported(false), 1000);
    } catch (e) {
      console.error("Failed to parse imported state", e);
      setTextareaError(true);
    }
  };

  const cancelImport = () => {
    setDirty(false);
    setTextareaError(false);
    setFormValue("");
  };

  const { performCopy, copySuccess } = useCopyToClipboard({
    timeout: 1500,
  });

  useEffect(() => {
    setTimeout(
      () => (document.querySelector("#stateField") as HTMLElement)?.focus(),
      400,
    );
  }, []);

  return (
    <div>
      <div className="my-2">
        <Accordion.Root className="accordion" type="single" collapsible>
          <Accordion.Item value="advanced">
            <Accordion.Trigger className="trigger mb-0.5">
              <Link
                size="2"
                role="button"
                className="text-left leading-3 hover:underline"
              >
                <PiCaretRightFill className="caret mr-0.5" size={12} />
                Select which overrides to export
              </Link>
            </Accordion.Trigger>
            <Accordion.Content className="accordionInner overflow-hidden w-full">
              <div className="box py-1">
                <div className="flex justify-between items-center my-1">
                  <label className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
                    <Checkbox
                      size="1"
                      checked={includeFeatures}
                      onCheckedChange={(b) => setIncludeFeatures(!!b)}
                    />
                    <span>Features</span>
                  </label>
                  {numForcedFeatures > 0 ? (
                    <Badge color="amber" radius="medium">
                      {numForcedFeatures}
                    </Badge>
                  ) : (
                    <Badge color="gray" radius="medium" variant="soft">
                      none
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center my-1">
                  <label className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
                    <Checkbox
                      size="1"
                      checked={includeExperiments}
                      onCheckedChange={(b) => setIncludeExperiments(!!b)}
                    />
                    <span>Experiments</span>
                  </label>
                  {numForcedVariations > 0 ? (
                    <Badge color="amber" radius="medium">
                      {numForcedVariations}
                    </Badge>
                  ) : (
                    <Badge color="gray" radius="medium" variant="soft">
                      none
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center my-1">
                  <label className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
                    <Checkbox
                      size="1"
                      checked={includeAttributes}
                      onCheckedChange={(b) => setIncludeAttributes(!!b)}
                    />
                    <span>Attributes</span>
                  </label>
                  {numAttributeOverrides > 0 ? (
                    <Badge color="amber" radius="medium">
                      {numAttributeOverrides}
                    </Badge>
                  ) : (
                    <Badge color="gray" radius="medium" variant="soft">
                      none
                    </Badge>
                  )}
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>

      <div className="my-4">
        <h2>Current State</h2>
        <div
          className={clsx(
            "rt-TextAreaRoot rt-r-size-2 rt-variant-surface mt-1 mb-2",
          )}
          style={{ minHeight: "unset !important" }}
        >
          <TextareaAutosize
            className="rt-reset rt-TextAreaInput mono"
            style={{ fontSize: "12px", lineHeight: "16px", padding: "6px 6px" }}
            id="stateField"
            name={"__stateField__"}
            value={statePayload}
            readOnly
            onFocus={(e) => e.target.select()}
            maxRows={2}
            minRows={1}
          />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="text-gray-11 text-xs">
            Copy and paste into Import field (
            {getOS() === "Mac" ? "⌘ + C" : "Ctrl + C"})
          </div>
          {!isDevtoolsPanel || isFirefox ? (
            copySuccess ? (
              <Button size="2" className="w-[100px]">
                <PiCheckBold />
                Copied
              </Button>
            ) : (
              <Button
                size="2"
                className="w-[100px]"
                onClick={() => {
                  if (!copySuccess) performCopy(formValue);
                }}
              >
                <PiArrowSquareOutBold />
                Copy
              </Button>
            )
          ) : null}
        </div>
      </div>

      <div className="my-t">
        <h2>Import</h2>
        <div
          className={clsx(
            "rt-TextAreaRoot rt-r-size-2 rt-variant-surface mt-1 mb-2",
            {
              "border border-red-700": textareaError,
            },
          )}
          style={{ minHeight: "unset !important" }}
        >
          <textarea
            className="rt-reset rt-TextAreaInput mono"
            style={{ fontSize: "12px", lineHeight: "16px", padding: "6px 6px" }}
            id="importField"
            name={"__stateField__"}
            value={formValue}
            onChange={(e) => {
              setFormValue(e.target.value);
              setDirty(true);
            }}
            onFocus={(e) => e.target.select()}
            rows={2}
          />
        </div>
        <div className="flex items-start justify-end gap-3">
          <div className="text-gray-11 text-xs flex-1">
            Paste to import ({getOS() === "Mac" ? "⌘ + V" : "Ctrl + V"})
          </div>
          {dirty ? (
            <div className="flex items-center gap-3">
              <Link href="#" size="2" role="button" onClick={cancelImport}>
                Cancel
              </Link>
              <Button
                type="button"
                size="2"
                onClick={importState}
                disabled={!dirty}
                className="w-[100px]"
              >
                <PiArrowSquareInBold />
                Import
              </Button>
            </div>
          ) : imported ? (
            <Button
              type="button"
              size="2"
              onClick={importState}
              className="w-[100px]"
            >
              <PiCheckBold />
              Imported
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
