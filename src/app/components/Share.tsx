import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Checkbox, Link, Switch } from "@radix-ui/themes";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { PiCaretRightFill, PiCheckBold, PiLinkBold } from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";
import { Attributes } from "@growthbook/growthbook";
import { getOS } from "@/app/utils";
import * as Accordion from "@radix-ui/react-accordion";
import ValueField from "@/app/components/ValueField";
import { NAV_H } from "@/app";

type StatePayload = {
  features?: Record<string, any>;
  experiments?: Record<string, number>;
  attributes?: Record<string, any>;
};

const Share = ({ close }: { close: () => void }) => {
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
  const [url] = useTabState<string>("url", "");

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

  const shareableLink = useMemo(() => {
    if (!url) return "";
    const payloadObj: StatePayload = {
      ...(includeFeatures ? { features: forcedFeatures } : {}),
      ...(includeExperiments ? { experiments: forcedVariations } : {}),
      ...(includeAttributes ? { attributes: overriddenAttributes } : {}),
    };
    const payload = JSON.stringify(payloadObj);
    let u = url;
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("_gbdebug", encodeURIComponent(payload));
      u = urlObj.href;
    } catch (e) {
      console.error("Unable to create link", { url, payloadObj });
    }
    return u;
  }, [
    includeFeatures,
    includeExperiments,
    includeAttributes,
    forcedFeatures,
    forcedVariations,
    overriddenAttributes,
    url,
  ]);

  const overridesText = useMemo(() => {
    let parts: string[] = [];
    includeFeatures && parts.push("features");
    includeExperiments && parts.push("experiments");
    includeAttributes && parts.push("attributes");
    if (!parts.length) return "none";
    return parts.join(", ");
  }, [includeFeatures, includeExperiments, includeAttributes]);

  const { performCopy, copySuccess } = useCopyToClipboard({
    timeout: 1500,
  });
  useEffect(() => {
    if (copySuccess) {
      setTimeout(close, 1000);
    }
  }, [copySuccess]);

  useEffect(() => {
    setTimeout(
      () => (document.querySelector("#shareLinkField") as HTMLElement)?.focus(),
      400,
    );
  }, []);

  return (
    <div>
      <div className="mt-1 text-gray-12 text-sm">
        Share your current session with other DevTools users
      </div>

      <div className="my-4">
        <Accordion.Root className="accordion" type="single" collapsible>
          <Accordion.Item value="advanced">
            <Accordion.Trigger className="trigger mb-0.5">
              <Link
                size="2"
                role="button"
                className="text-left leading-3 hover:underline"
              >
                <PiCaretRightFill className="caret mr-0.5" size={12} />
                Share overrides{" "}
                <span className="text-xs">({overridesText})</span>
              </Link>
            </Accordion.Trigger>
            <Accordion.Content className="accordionInner overflow-hidden w-full">
              <div className="box py-1">
                <div className="my-1">
                  <label className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
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
                      <Badge color="gray" radius="full" variant="soft">
                        none
                      </Badge>
                    )}
                  </label>
                </div>
                <div className="my-1">
                  <label className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
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
                      <Badge color="gray" radius="full" variant="soft">
                        none
                      </Badge>
                    )}
                  </label>
                </div>
                <div className="my-1">
                  <label className="inline-flex gap-2 text-sm items-center select-none cursor-pointer hover:text-violet-11">
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
                      <Badge color="gray" radius="full" variant="soft">
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

      <div>
        <div className="rt-TextFieldRoot rt-r-size-2 rt-variant-surface">
          <input
            id="shareLinkField"
            className="rt-reset rt-TextFieldInput text-xs"
            type="text"
            value={shareableLink}
            onFocus={(e) => e.target.select()}
          />
        </div>
        {isDevtoolsPanel && !isFirefox ? (
          <div className="text-gray-11 text-xs">
            Copy this link to share ({getOS() === "Mac" ? "⌘ + C" : "Ctrl + C"})
          </div>
        ) : null}
      </div>

      {!isDevtoolsPanel || isFirefox ? (
        <div className="mt-8">
          {copySuccess ? (
            <Button size="3" className="w-full">
              <PiCheckBold />
              Link copied
            </Button>
          ) : (
            <Button
              size="3"
              className="w-full"
              onClick={() => {
                if (!copySuccess) performCopy(shareableLink);
              }}
            >
              <PiLinkBold />
              Copy Link
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Share;
