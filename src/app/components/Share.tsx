import React, {useEffect, useMemo, useState} from "react";
import {Badge, Button, Switch} from "@radix-ui/themes";
import {useCopyToClipboard} from "@/app/hooks/useCopyToClipboard";
import {PiCheckBold, PiLinkBold} from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";
import {Attributes} from "@growthbook/growthbook";

type StatePayload = {
  features?: Record<string, any>;
  experiments?: Record<string, number>;
  attributes?: Record<string, any>;
}

const Share = ({ close }: { close: () => void; }) => {
  const isDevtoolsPanel = useMemo(() => document.querySelector("#root")?.getAttribute("data-is-devtools") === "1", []);
  const isFirefox = navigator.userAgent.includes("Firefox");

  const [forcedFeatures, setForcedFeatures, forcedFeaturesReady] = useTabState<Record<string, any>>("forcedFeatures", {});
  const [forcedVariations, setForcedVariations, forcedVariationsReady] = useTabState<Record<string, any>>("forcedVariations", {});
  const [overriddenAttributes, setOverriddenAttributes, overriddenAttributesReady] = useTabState<Attributes>("overriddenAttributes", {});
  const [url] = useTabState<string>("url", "");

  const numForcedFeatures = Object.keys(forcedFeatures || {}).length;
  const numForcedVariations = Object.keys(forcedVariations || {}).length;
  const numAttributeOverrides = Object.keys(overriddenAttributes || {}).length;

  const [includeFeatures, setIncludeFeatures] = useState(numForcedFeatures > 0);
  const [includeExperiments, setIncludeExperiments] = useState(numForcedVariations > 0);
  const [includeAttributes, setIncludeAttributes] = useState(numAttributeOverrides > 0);

  useEffect(() => {
    if (forcedFeaturesReady && forcedVariationsReady && overriddenAttributesReady) {
      setIncludeFeatures(numForcedFeatures > 0);
      setIncludeExperiments(numForcedVariations > 0);
      setIncludeAttributes(numAttributeOverrides > 0);
    }
  }, [numForcedFeatures, numForcedVariations, numAttributeOverrides, forcedFeaturesReady, forcedVariationsReady, overriddenAttributesReady]);

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
      console.error("Unable to create link", {url, payloadObj});
    }
    return u;
  }, [includeFeatures, includeExperiments, includeAttributes, forcedFeatures, forcedVariations, overriddenAttributes, url])

  const { performCopy, copySuccess } = useCopyToClipboard({
    timeout: 1500,
  });
  useEffect(() => {
    if (copySuccess) {
      setTimeout(close, 1000);
    }
  }, [copySuccess]);

  return (
    <div>
      <div className="mt-1 text-gray-12 text-xs">
        Get a shareable link for your current DevTools session.
        Recipient must have GrowthBook DevTools installed.
      </div>

      <div className="my-4">
        <div className="text-md mb-2">
          Share overrides for...
        </div>
        <div className="box">
        <label className="my-1 flex gap-2 text-sm items-center select-none cursor-pointer">
          <Switch
            size="1"
            checked={includeFeatures}
            onCheckedChange={(b) => setIncludeFeatures(b)}
          />
          <span>Features</span>{" "}
          {numForcedFeatures > 0 ? (
            <Badge color="amber" radius="full">{numForcedFeatures}</Badge>
          ): (
            <Badge color="gray" radius="full" variant="soft" className="text-2xs">none</Badge>
          )}
        </label>
        <label className="my-1 flex gap-2 text-sm items-center select-none cursor-pointer">
          <Switch
            size="1"
            checked={includeExperiments}
            onCheckedChange={(b) => setIncludeExperiments(b)}
          />
          <span>Experiments</span>{" "}
          {numForcedVariations > 0 ? (
            <Badge color="amber" radius="full">{numForcedVariations}</Badge>
          ): (
            <Badge color="gray" radius="full" variant="soft" className="text-2xs">none</Badge>
          )}
        </label>
        <label className="my-1 flex gap-2 text-sm items-center select-none cursor-pointer">
          <Switch
            size="1"
            checked={includeAttributes}
            onCheckedChange={(b) => setIncludeAttributes(b)}
          />
          <span>Attributes</span>{" "}
          {numAttributeOverrides > 0 ? (
            <Badge color="amber" radius="full">{numAttributeOverrides}</Badge>
          ): (
            <Badge color="gray" radius="full" variant="soft" className="text-2xs">none</Badge>
          )}
        </label>
        </div>
      </div>

      <div>
        <div className="rt-TextFieldRoot rt-r-size-2 rt-variant-surface">
          <input
            className="rt-reset rt-TextFieldInput text-xs"
            type="text"
            value={shareableLink}
            onFocus={(e) => e.target.select()}
          />
        </div>
        {isDevtoolsPanel && !isFirefox ? (
          <div className="text-gray-11 text-xs">Copy this link to share</div>
        ) : null}
      </div>

      <div className="mt-8">
        {isDevtoolsPanel && !isFirefox ? (
          <Button size="3" className="w-full" variant="soft" onClick={close}>
            Close
          </Button>
        ) :
        copySuccess ? (
          <Button size="3" className="w-full">
            <PiCheckBold/>
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
            <PiLinkBold/>
            Copy Link
          </Button>
        )}
      </div>

    </div>
  );
};

export default Share;
