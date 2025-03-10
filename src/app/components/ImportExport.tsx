import React, { useEffect, useMemo, useState } from "react";
import {Badge, Button, Checkbox, Link, Switch} from "@radix-ui/themes";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import {PiCaretRightFill, PiCheckBold, PiDownloadSimpleBold, PiLinkBold, PiUploadSimpleBold} from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";
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
      document.querySelector("#root")?.getAttribute("data-is-devtools") === "1",
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

  const [formValue, setformValue] = useState("");
  const [textareaError, setTextareaError] = useState(false);
  const [dirty, setDirty] = useState(false);

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

  const overridesText = useMemo(() => {
    let parts: string[] = [];
    includeFeatures && parts.push("features");
    includeExperiments && parts.push("experiments");
    includeAttributes && parts.push("attributes");
    if (!parts.length) return "none";
    return parts.join(", ");
  }, [includeFeatures, includeExperiments, includeAttributes]);

  useEffect(() => {
    if (!dirty) {
      setformValue(statePayload);
    }
  }, [statePayload, dirty]);

  const importState = () => {
    try {
      const payload = JSON.parse(formValue);
      if (payload?.attributes && typeof payload.attributes === "object") {
        setOverriddenAttributes(payload.attributes);
      }
      if (payload?.features && typeof payload.features === "object") {
        setForcedFeatures(payload.features);
      }
      if (payload?.experiments && typeof payload.experiments === "object") {
        setForcedVariations(payload.experiments);
      }

      setTextareaError(false);
      setDirty(false);
    } catch (e) {
      console.error("Failed to parse imported state", e);
      setTextareaError(true);
    }
  };

  const cancelImport = () => {
    setDirty(false);
    setTextareaError(false);
  };

  const { performCopy, copySuccess } = useCopyToClipboard({
    timeout: 1500,
  });

  useEffect(() => {
    setTimeout(
      () => (document.querySelector("#stateField") as HTMLElement)?.focus(),
      100,
    );
  }, []);

  return (
    <div>
      <div className="mt-1 text-gray-12 text-xs">
        Import or export a DevTools session by copying and pasting the following data.
      </div>

      <div className="my-4">
        <Accordion.Root
          className="accordion"
          type="single"
          collapsible
        >
          <Accordion.Item value="advanced">
            <Accordion.Trigger className="trigger mb-0.5">
              <Link
                size="2"
                role="button"
                className={clsx("text-left leading-3", {
                  "hover:underline": !dirty,
                  "opacity-50": dirty,
                })}
                color={dirty ? "gray" : undefined}
              >
                <PiCaretRightFill className="caret mr-0.5" size={12} />
                Export overrides <span className="text-xs">({overridesText})</span>
              </Link>
            </Accordion.Trigger>
            <Accordion.Content
              className={clsx("accordionInner overflow-hidden w-full", {
                "opacity-50": dirty,
              })}
            >
              <div className="box py-1">
                <div className="my-1">
                  <label
                    className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
                    <Checkbox
                      size="1"
                      checked={includeFeatures}
                      onCheckedChange={(b) => setIncludeFeatures(!!b)}
                    />
                    <span>Features</span>{" "}
                    {numForcedFeatures > 0 ? (
                      <Badge color="amber" radius="full">
                        {numForcedFeatures}
                      </Badge>
                    ) : (
                      <Badge
                        color="gray"
                        radius="full"
                        variant="soft"
                      >
                        none
                      </Badge>
                    )}
                  </label>
                </div>
                <div className="my-1">
                  <label
                    className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
                    <Checkbox
                      size="1"
                      checked={includeExperiments}
                      onCheckedChange={(b) => setIncludeExperiments(!!b)}
                    />
                    <span>Experiments</span>{" "}
                    {numForcedVariations > 0 ? (
                      <Badge color="amber" radius="full">
                        {numForcedVariations}
                      </Badge>
                    ) : (
                      <Badge
                        color="gray"
                        radius="full"
                        variant="soft"
                      >
                        none
                      </Badge>
                    )}
                  </label>
                </div>
                <div className="my-1">
                  <label
                    className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
                    <Checkbox
                      size="1"
                      checked={includeAttributes}
                      onCheckedChange={(b) => setIncludeAttributes(!!b)}
                    />
                    <span>Attributes</span>{" "}
                    {numAttributeOverrides > 0 ? (
                      <Badge color="amber" radius="full">
                        {numAttributeOverrides}
                      </Badge>
                    ) : (
                      <Badge
                        color="gray"
                        radius="full"
                        variant="soft"
                      >
                        none
                      </Badge>
                    )}
                  </label>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>

      <div className="my-4">
        <h2>{!dirty ? (
          <>
            Current State{" "}
            <span className="text-xs">(Paste to import)</span>
          </>
        ) : "Import State"}</h2>
        <div
          className={clsx(
            "rt-TextAreaRoot rt-r-size-2 rt-variant-surface mt-1 mb-2",
            {
              "border border-red-700": textareaError,
            },
          )}
          style={{minHeight: "unset !important"}}
        >
          <TextareaAutosize
            className="rt-reset rt-TextAreaInput mono"
            style={{fontSize: "12px", lineHeight: "16px", padding: "6px 6px"}}
            id="stateField"
            name={"__stateField__"}
            value={formValue}
            onChange={(e) => {
              setformValue(e.target.value);
              setDirty(true);
            }}
            onFocus={(e) => e.target.select()}
            maxRows={4}
            minRows={2}
          />
        </div>
          {dirty ? (
            <div className="flex items-center justify-end gap-3">
              <Link
                href="#"
                size="2"
                role="button"
                onClick={cancelImport}
              >
                Cancel
              </Link>
              <Button
                type="button"
                size="2"
                onClick={importState}
                disabled={!dirty}
              >
                <PiDownloadSimpleBold />
                Import
              </Button>
            </div>
          ) : (
            <>
              {isDevtoolsPanel && !isFirefox ? (
                <div className="text-gray-11 text-xs">
                  Copy this data to export ({getOS() === "Mac" ? "⌘ + C" : "Ctrl + C"})
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3">
                  {copySuccess ? (
                    <Button
                      size="2"
                      className="w-[145px]"
                    >
                      <PiCheckBold/>
                      Copied
                    </Button>
                  ) : (
                    <Button
                      size="2"
                      className="w-[145px]"
                      onClick={() => {
                        if (!copySuccess) performCopy(formValue);
                      }}
                    >
                      <PiUploadSimpleBold />
                      Export (Copy)
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
      </div>

      <div className="mt-8">
        <Button size="3" className="w-full" variant="soft" onClick={close}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ImportExport;
