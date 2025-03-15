import { MW, NAV_H } from "@/app";
import {
  Badge,
  Button,
  Callout,
  IconButton,
  Link,
  Select,
  Switch,
  Tooltip,
} from "@radix-ui/themes";
import {
  PiArrowCounterClockwiseBold,
  PiArrowSquareOut,
  PiCaretRightFill,
  PiTimerBold,
  PiXBold,
} from "react-icons/pi";
import EditableValueField from "@/app/components/EditableValueField";
import ValueField from "@/app/components/ValueField";
import Rule, {
  ActivateValueButton,
  USE_PREVIOUS_LOG_IF_MATCH,
} from "@/app/components/Rule";
import * as Accordion from "@radix-ui/react-accordion";
import React, { useEffect, useState } from "react";
import { HEADER_H, LEFT_PERCENT, SelectedFeature } from "./FeaturesTab";
import useGlobalState from "@/app/hooks/useGlobalState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";
import useTabState, {getActiveTabId} from "@/app/hooks/useTabState";
import DebugLogger from "@/app/components/DebugLogger";
import { TbEyeSearch } from "react-icons/tb";
import useApi from "@/app/hooks/useApi";
import {SDKAttribute} from "@/app/gbTypes";
import clsx from "clsx";

export type ApiFeatureWithRevisions = {
  archived: boolean;
  dateCreated: boolean;
  dateUpdated: boolean;
  defaultValue: string;
  valueType: "string" | "number" | "boolean" | "json";
  description: string;
  environments: Record<string, any>;
  id: string;
  owner: string;
  project: string;
  tags: string[];
  revision: { comment: string; date: string; publishedBy?: string; version?: number; }
  revisions: Revision[];
}
export type Revision = {
  baseVersion?: number;
  version: number;
  comment: string;
  date: string;
  status: "draft" | "published" | "discarded" | "approved" | "changes-requested" | "pending-review";
  publishedBy?: string;
  rules: Record<string, any>;
  definitions: Record<string, any>;
}
export type SelectedFeatureWithMeta = SelectedFeature & {
  comment?: string;
  date?: string;
  publishedBy?: string;
  version?: number;
}

export default function FeatureDetail({
  selectedFid,
  setSelectedFid,
  selectedFeature,
  open,
  isResponsive,
}: {
  selectedFid?: string;
  setSelectedFid: (s: string | undefined) => void;
  selectedFeature?: SelectedFeature;
  open: boolean;
  isResponsive: boolean;
}) {
  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);

  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );

  const [hideInactiveRules, setHideInactiveRules] = useTabState<boolean>(
    "hideInactiveRules",
    true,
  );
  const [overrideFeature, setOverrideFeature] = useState(false);

  const setForcedFeature = (fid: string, value: any) => {
    const newForcedFeatures = { ...forcedFeatures };
    newForcedFeatures[fid] = value;
    setForcedFeatures(newForcedFeatures);
  };
  const unsetForcedFeature = (fid: string) => {
    const newForcedFeatures = { ...forcedFeatures };
    delete newForcedFeatures[fid];
    setForcedFeatures(newForcedFeatures);
    setOverrideFeature(false);
  };

  const [revisions, setRevisions] = useTabState<Revision[] | null>(
    selectedFid ? `revisions_${selectedFid}` : "",
    null
  );
  // cache for the version of the feature in the SDK in case overwritten by revision selector
  const [sdkRevision, setSdkRevision] = useTabState<SelectedFeatureWithMeta | undefined>(
    selectedFid ? `sdkRevision_${selectedFid}` : "",
    undefined
  );
  const [revisionNum, setRevisionNum] = useTabState<number | null>(
    selectedFid ? `revisionNum_${selectedFid}` : "",
    null
  );
  const [revisionEnvs, setRevisionEnvs] = useTabState<string[] | null>(
    selectedFid ? `revisionEnvs_${selectedFid}` : "",
    null
  );
  const [revisionEnv, setRevisionEnv, revisionEnvReady] = useTabState<string | null>(
    selectedFid ? `revisionEnv_${selectedFid}` : "",
    null
  );

  const debugLog = selectedFeature?.evaluatedFeature?.debug;
  const defaultValueStatus = debugLog
    ? debugLog?.[debugLog.length - 1]?.[0]?.startsWith(
        USE_PREVIOUS_LOG_IF_MATCH,
      )
      ? "matches"
      : "unreachable"
    : "matches";

  useEffect(() => {
    if (selectedFid) {
      if (selectedFid in forcedFeatures) {
        setOverrideFeature(true);
      } else {
        setOverrideFeature(false);
      }
    }
  }, [selectedFid, JSON.stringify(forcedFeatures)]);

  const {
    isLoading: featureMetaLoading,
    error: featureMetaError,
    data: featureMetaData,
  } = useApi<{ feature: ApiFeatureWithRevisions }>(
    selectedFid ?
      `/api/v1/features/${selectedFid}?withRevisions=drafts` :
      null
  );

  useEffect(() => {
    if (!featureMetaLoading && featureMetaData && revisionEnvReady) {
      if (!sdkRevision && selectedFeature) {
        // make sure default revision is saved (with meta info) in case of payload mutation
        setSdkRevision({...selectedFeature, ...(featureMetaData?.feature?.revision ?? {})});
      }
      const revisions = featureMetaData?.feature?.revisions;
      if (revisions?.length && Object.keys(revisions?.[0])?.length) {
        setRevisions(featureMetaData.feature.revisions);
        const envs = Object.keys(revisions?.[0]?.rules || {});
        setRevisionEnvs(envs);
        if (!revisionEnv || !envs.includes(revisionEnv)) {
          let env = envs?.[0];
          const devLike = envs.find((env) => env.toLowerCase().startsWith("dev"));
          const stagingLike = envs.find((env) => env.toLowerCase().startsWith("staging"));
          const qaLike = envs.find((env) => env.toLowerCase().startsWith("qa"));
          if (devLike) {
            env = devLike;
          } else if (stagingLike) {
            env = stagingLike;
          } else if (qaLike) {
            env = qaLike;
          }
          setRevisionEnv(env);
        }
      }
    }
  }, [featureMetaData, featureMetaLoading, revisionEnvReady]);

  useEffect(() => {
    (async () => {
      if (revisions && sdkRevision && selectedFid) {
        let payloadPatch: any = null;
        if (revisionNum !== null && revisionEnv !== null) {
          const revision = revisions.find((r) => r.version === revisionNum);
          const definition: string | undefined = revision?.definitions?.[revisionEnv];
          let decoded: any = null;
          try {
            decoded = JSON.parse(definition ?? "");
          } catch (e) {
            console.error("Draft decoding error", e)
          }
          if (decoded) {
            payloadPatch = {
              features: {[selectedFid]: {...decoded, isDraft: true}}
            };
          }
        } else if (revisionNum === null) {
          payloadPatch = {
            features: {[selectedFid]: {...sdkRevision.feature, isDraft: false}}
          };
        }

        if (payloadPatch) {
          const activeTabId = await getActiveTabId();
          if (activeTabId) {
            if (chrome?.tabs) {
              await chrome.tabs.sendMessage(activeTabId, {
                type: "PATCH_PAYLOAD",
                data: payloadPatch,
              });
            } else {
              chrome.runtime.sendMessage({
                type: "PATCH_PAYLOAD",
                data: payloadPatch,
              });
            }
          }
        }
      }
    })();
  }, [revisionNum, revisionEnv, revisions, sdkRevision]);

  const defaultActive =
    JSON.stringify(selectedFeature?.evaluatedFeature?.result?.value) ===
    JSON.stringify(selectedFeature?.feature?.defaultValue);

  const rightPercent = isResponsive ? 1 : 1 - LEFT_PERCENT;

  return (
    <div
      className="featureDetailWrapper fixed overflow-y-auto"
      style={{
        top: NAV_H + HEADER_H,
        height: `calc(100vh - ${NAV_H + HEADER_H}px)`,
        width: `${rightPercent * 100}vw`,
        maxWidth: MW * rightPercent,
        right: open
          ? `calc(max((100vw - ${MW}px)/2, 0px))`
          : `-${rightPercent * 100}vw`,
        zIndex: 1000,
        pointerEvents: !open ? "none" : undefined,
      }}
    >
      <div className="featureDetail" key={`selected_${selectedFid}`}>
        <div className="header">
          {selectedFid && (
            <>
              <div className="flex items-start gap-2">
                <h2 className="font-bold flex-1">{selectedFid}</h2>
                <IconButton
                  size="3"
                  variant="ghost"
                  radius="full"
                  style={{ margin: "0 -8px -10px 0" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFid(undefined);
                  }}
                >
                  <PiXBold />
                </IconButton>
              </div>
              <Link
                size="2"
                href={`${appOrigin}/features/${selectedFid}`}
                target="_blank"
              >
                GrowthBook
                <PiArrowSquareOut
                  size={16}
                  className="inline-block mb-1 ml-0.5"
                />
              </Link>
            </>
          )}
        </div>

        <div className="content">
          {selectedFeature?.feature?.isDraft ? (
            <Callout.Root
              color="indigo"
              size="1"
              className="block py-1.5 px-3 mt-2 mb-4"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-sm">
                  <TbEyeSearch className="inline-block mr-1 mb-0.5" />
                  Previewing draft
                </div>
                <Link
                  size="1"
                  href="#"
                  role="button"
                  onClick={() => setRevisionNum(null)}
                >
                  <PiArrowCounterClockwiseBold className="inline-block mr-1" />
                  Exit preview
                </Link>
              </div>
            </Callout.Root>
          ) : null}
          {selectedFeature?.feature?.noDefinition ? (
            <Callout.Root
              color="amber"
              size="1"
              className="py-1.5 px-3 mt-2 mb-4"
            >
              <Tooltip content="This feature id is not in your SDK payload yet was still evaluated. This may indicate a stale reference in your codebase or an unpublished feature.">
                <span className="text-sm">
                  <PiTimerBold className="inline-block mr-1 mb-0.5" />
                  Not in SDK payload
                </span>
              </Tooltip>
            </Callout.Root>
          ) : null}

          <div className="my-1">
            <div className="flex items-center justify-between my-2">
              <div className="label font-semibold">Current value</div>
              {overrideFeature && (
                <Button
                  color="amber"
                  variant="solid"
                  radius="full"
                  size="1"
                  onClick={(e) => {
                    e.preventDefault();
                    setOverrideFeature(false);
                    selectedFid && unsetForcedFeature(selectedFid);
                  }}
                  className="flex gap-1 items-center bg-amber-200 text-amber-700 hover:bg-amber-300"
                >
                  Clear override
                  <PiXBold />
                </Button>
              )}
            </div>
            {selectedFeature && selectedFid ? (
              <EditableValueField
                value={selectedFeature?.evaluatedFeature?.result?.value}
                setValue={(v) => {
                  setForcedFeature(selectedFid, v);
                  setOverrideFeature(true);
                }}
                valueType={selectedFeature?.valueType}
              />
            ) : null}
          </div>

          {!selectedFeature?.feature?.noDefinition ? (
            <>
              <div className="mt-6 mb-2 py-1 border-b border-gray-a6">
                <div className="flex justify-between items-end text-md font-semibold">
                  <div>Rules and Values</div>
                  <label
                    className="flex gap-1 text-xs items-center font-normal select-none cursor-pointer flex-shrink-0">
                    <span>Hide inactive rules</span>
                    <Switch
                      size="1"
                      checked={hideInactiveRules}
                      onCheckedChange={(b) => setHideInactiveRules(b)}
                    />
                  </label>
                </div>
                {revisions ? (
                  <RevisionSelector
                    sdkRevision={sdkRevision}
                    revisions={revisions}
                    revisionNum={revisionNum}
                    setRevisionNum={setRevisionNum}
                    revisionEnvs={revisionEnvs}
                    revisionEnv={revisionEnv}
                    setRevisionEnv={setRevisionEnv}
                  />
                ) : null}
              </div>

              {!hideInactiveRules || defaultValueStatus === "matches" ? (
                <div
                  className={`rule relative ${defaultValueStatus}`}
                  style={{padding: "12px 12px 12px 14px"}}
                >
                  <div className="text-sm font-semibold mb-2">
                    Default value
                    <div className="inline-block ml-3 status capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md">
                      {defaultValueStatus === "matches" ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="flex gap-2 items-start flex-wrap text-xs">
                    <ValueField
                      value={selectedFeature?.feature?.defaultValue}
                      valueType={selectedFeature?.valueType}
                      maxHeight={60}
                      customPrismStyle={{ padding: "2px" }}
                      customPrismOuterStyle={{
                        flex: "1 1 auto",
                        width: "100%",
                      }}
                      customBooleanStyle={{
                        fontSize: "12px",
                        display: "inline-block",
                      }}
                    />
                    {selectedFid ? (
                      <div className="flex flex-1 justify-end">
                        <ActivateValueButton
                          onClick={() => {
                            setForcedFeature(
                              selectedFid,
                              selectedFeature?.feature?.defaultValue,
                            );
                            setOverrideFeature(true);
                          }}
                          disabled={defaultActive}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {selectedFid &&
              selectedFeature &&
              (selectedFeature?.feature?.rules ?? []).length ? (
                <>
                  {selectedFeature?.feature?.rules?.map((rule, i) => {
                    return (
                      <Rule
                        key={i}
                        rule={rule}
                        rules={selectedFeature.feature.rules || []}
                        i={i}
                        fid={selectedFid}
                        valueType={selectedFeature.valueType}
                        evaluatedFeature={selectedFeature.evaluatedFeature}
                        hideInactive={hideInactiveRules}
                        onApply={(v: any) => {
                          setForcedFeature(selectedFid, v);
                          setOverrideFeature(true);
                        }}
                      />
                    );
                  })}
                </>
              ) : null}

              {selectedFeature ? (
                <div className="mt-3 mb-1">
                  {debugLog ? <DebugLogger logs={debugLog} /> : null}

                  <Accordion.Root
                    className="accordion mt-2"
                    type="single"
                    collapsible
                  >
                    <Accordion.Item value="feature-definition">
                      <Accordion.Trigger className="trigger mb-0.5">
                        <Link
                          size="2"
                          role="button"
                          className="hover:underline"
                        >
                          <PiCaretRightFill
                            className="caret mr-0.5"
                            size={12}
                          />
                          Full feature definition
                        </Link>
                      </Accordion.Trigger>
                      <Accordion.Content className="accordionInner overflow-hidden w-full">
                        <ValueField
                          value={selectedFeature.feature}
                          valueType="json"
                          maxHeight={null}
                        />
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>
              ) : null}
            </>
          ) : debugLog ? (
            <div className="mt-4 mb-1">
              <DebugLogger logs={debugLog} startCollapsed={false} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RevisionSelector({
  sdkRevision,
  revisions,
  revisionNum,
  setRevisionNum,
  revisionEnvs,
  revisionEnv,
  setRevisionEnv,
}: {
  sdkRevision?: SelectedFeatureWithMeta;
  revisions: Revision[];
  revisionNum: number | null;
  setRevisionNum: (n: number | null) => void;
  revisionEnvs: string[] | null;
  revisionEnv: string | null;
  setRevisionEnv: (s: string | null) => void;
}) {
  const liveRevisionNum = sdkRevision?.version;
  const revision = revisions.find((r) => r.version === revisionNum);

  const drawLiveRevisionRow = () => {
    return (
      <div className="flex justify-between w-full">
        <span>{liveRevisionNum !== undefined ? `Revision ${liveRevisionNum}` : "Live revision"}</span>
        <Badge size="1" className="text-2xs" color="teal" ml="3">
          live
        </Badge>
      </div>
    );
  }
  const drawRevisionRow = (revision: Revision) => {
    const revisionStatus = revision?.status === "published" ? "live" : revision?.status && revision?.status !== "discarded" ? "draft" : "inactive";
    const revisionStatusColor = revisionStatus === "draft" ? "indigo" : revisionStatus === "live" ? "teal" : "gray";
    return (
      <div className="flex justify-between w-full">
        <span>Revision {revision.version}</span>
        <Badge size="1" className="text-2xs" color={revisionStatusColor} ml="3">
          {revisionStatus}
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-x-4 gap-y-1 justify-between flex-wrap my-1">
      <div>
        <Select.Root
          size="1"
          value={JSON.stringify(revisionNum)}
          onValueChange={(v) => {
            setRevisionNum(v !== "null" ? parseInt(v) : null);
          }}
        >
          <Select.Trigger>
            <div className="w-[120px] overflow-hidden overflow-ellipsis">
              {revision ? drawRevisionRow(revision) : drawLiveRevisionRow()}
            </div>
          </Select.Trigger>
          <Select.Content variant="soft">
            <Select.Item value="null">
              {drawLiveRevisionRow()}
            </Select.Item>
            {revisions.map((r) => (
              <Select.Item value={r.version + ""} key={r.version}>
                {drawRevisionRow(r)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div className="flex items-center gap-1">
        <div className="text-xs text-gray-10 font-semibold">Env:</div>
        {revisionNum !== null && revisionEnvs ? (
          <Select.Root
            size="1"
            value={revisionEnv ?? ""}
            onValueChange={(v) => {
              setRevisionEnv(v ?? null);
            }}
          >
            <Select.Trigger>
              <div className="min-w-[70px] max-w-[150px] overflow-hidden overflow-ellipsis">{revisionEnv}</div>
            </Select.Trigger>
            <Select.Content variant="soft">
              {revisionEnvs.map((env) => (
                <Select.Item value={env} key={env}>
                  {env}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <div className="rt-reset rt-SelectTrigger rt-r-size-1 rt-variant-surface text-gray-10">
            using SDK definition
          </div>
        )}
      </div>
    </div>
  );
}
