import { MW, NAV_H } from "@/app";
import {
  Badge,
  Button,
  Callout,
  DropdownMenu,
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
  PiFunnelBold,
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
import useTabState, { getActiveTabId } from "@/app/hooks/useTabState";
import DebugLogger from "@/app/components/DebugLogger";
import { TbEyeSearch } from "react-icons/tb";
import useApi from "@/app/hooks/useApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  revision: {
    comment: string;
    date: string;
    publishedBy?: string;
    version?: number;
  };
  revisions: Revision[];
};
export type Revision = {
  baseVersion?: number;
  version: number;
  comment: string;
  date: string;
  status:
    | "draft"
    | "published"
    | "discarded"
    | "approved"
    | "changes-requested"
    | "pending-review";
  publishedBy?: string;
  rules: Record<string, any>;
  definitions: Record<string, any>;
};
export type SelectedFeatureWithMeta = SelectedFeature & {
  comment?: string;
  date?: string;
  publishedBy?: string;
  version?: number;
};

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

  const [revisionsByFid, setRevisionsByFid] = useTabState<
    Record<string, Revision[]>
  >("revisionsByFid", {});

  // cache for the version of the feature in the SDK in case overwritten by revision selector
  const [sdkRevisionByFid, setSdkRevisionByFid, sdkRevisionByFidReady] =
    useTabState<Record<string, SelectedFeatureWithMeta>>(
      "sdkRevisionByFid",
      {},
    );

  const [revisionNumByFid, setRevisionNumByFid, revisionNumByFidReady] =
    useTabState<Record<string, number | null>>("revisionNumByFid", {});

  const [revisionEnvsByFid, setRevisionEnvsByFid, revisionEnvsByFidReady] =
    useTabState<Record<string, string[] | null>>("revisionEnvsByFid", {});

  const [revisionEnvByFid, setRevisionEnvByFid, revisionEnvByFidReady] =
    useTabState<Record<string, string | null>>("revisionEnvById", {});

  const [fetchRevisionType, setFetchRevisionType] = useTabState<
    "drafts" | "all"
  >("fetchRevisionType", "drafts");

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
    selectedFid
      ? `/api/v1/features/${selectedFid}?withRevisions=${fetchRevisionType}`
      : null,
  );

  useEffect(() => {
    if (!selectedFid) return;
    if (!featureMetaLoading && featureMetaData && revisionEnvByFidReady) {
      if (!sdkRevisionByFid?.[selectedFid] && selectedFeature) {
        // make sure default revision is saved (with meta info) in case of payload mutation
        const newRevisionsByFid = {
          ...sdkRevisionByFid,
          [selectedFid]: {
            ...selectedFeature,
            ...(featureMetaData?.feature?.revision ?? {}),
          },
        };
        setSdkRevisionByFid(newRevisionsByFid);
      }
      const revisions = featureMetaData?.feature?.revisions ?? [];
      const newRevisionsByFid = {
        ...revisionsByFid,
        [selectedFid]: revisions,
      };
      setRevisionsByFid(newRevisionsByFid);

      const envs = Object.keys(revisions?.[0]?.rules || {});
      const newRevisionEnvsByFid = {
        ...revisionEnvsByFid,
        [selectedFid]: envs,
      };
      setRevisionEnvsByFid(newRevisionEnvsByFid);

      const revisionEnv = revisionEnvByFid?.[selectedFid];
      if (!revisionEnv || !envs.includes(revisionEnv)) {
        let env = envs?.[0];
        const devLike = envs.find((env) => env.toLowerCase().startsWith("dev"));
        const stagingLike = envs.find((env) =>
          env.toLowerCase().startsWith("staging"),
        );
        const qaLike = envs.find((env) => env.toLowerCase().startsWith("qa"));
        if (devLike) {
          env = devLike;
        } else if (stagingLike) {
          env = stagingLike;
        } else if (qaLike) {
          env = qaLike;
        }
        const newRevisionEnvByFid = {
          ...revisionEnvByFid,
          [selectedFid]: env,
        };
        setRevisionEnvByFid(newRevisionEnvByFid);
      }
    }
  }, [selectedFid, featureMetaData, featureMetaLoading, revisionEnvByFidReady]);

  const changeRevision = ({
    num,
    env,
  }: {
    num?: number | null;
    env?: string | null;
  }) => {
    if (!selectedFid || !sdkRevisionByFidReady || !revisionNumByFidReady)
      return;
    const revisions = revisionsByFid?.[selectedFid];
    const sdkRevision = sdkRevisionByFid?.[selectedFid];

    if (revisions && sdkRevision) {
      if (num !== undefined) {
        setRevisionNumByFid({ ...revisionNumByFid, [selectedFid]: num });
      } else {
        num = revisionNumByFid?.[selectedFid] ?? null;
      }
      if (env !== undefined) {
        setRevisionEnvByFid({ ...revisionEnvByFid, [selectedFid]: env });
      } else {
        env = revisionEnvByFid?.[selectedFid] ?? null;
      }

      let payloadPatch: any = null;
      if (num !== null && env !== null) {
        const revision = revisions.find((r) => r.version === num);
        const definition: string | undefined = revision?.definitions?.[env];
        let decoded: any = null;
        try {
          decoded = JSON.parse(definition ?? "");
        } catch (e) {
          console.error("Draft decoding error", e);
        }
        if (decoded) {
          payloadPatch = {
            features: {
              [selectedFid]: {
                ...decoded,
                isDraft: true,
                isInactive:
                  revision?.version &&
                  sdkRevision?.version &&
                  revision.version <= sdkRevision.version,
              },
            },
          };
        }
      } else if (num === null) {
        payloadPatch = {
          features: {
            [selectedFid]: {
              ...sdkRevision.feature,
              isDraft: false,
              isInactive: false,
            },
          },
        };
      }

      if (payloadPatch) {
        (async () => {
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
        })();
      }
    }
  };

  // Reset any cached revision info in the UI if the payload is reverted to default
  // (ex: page navigation, page reload)
  useEffect(() => {
    if (
      selectedFid &&
      selectedFeature?.feature &&
      !selectedFeature.feature?.isDraft
    ) {
      if (revisionNumByFid?.[selectedFid] !== null) {
        setRevisionNumByFid({ ...revisionNumByFid, [selectedFid]: null });
      }
    }
  }, [selectedFid, JSON.stringify(selectedFeature?.feature)]);

  // Reset active revision if changing the filter to something less permissive
  useEffect(() => {
    if (
      fetchRevisionType === "drafts" &&
      selectedFeature?.feature?.isInactive
    ) {
      changeRevision({ num: null });
    }
  }, [fetchRevisionType]);

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
          {featureMetaData?.feature?.description ? (
            <div>
              <div className="label font-semibold mb-1">Description</div>
              <div className="box text-xs overflow-y-auto max-h-[150px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) => {
                    // even though we're on 9.0.0, the URL sanitization in our version is
                    // messing up & in urls. This code come from the latest version of react-markdown
                    const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;
                    const colon = url.indexOf(":");
                    const questionMark = url.indexOf("?");
                    const numberSign = url.indexOf("#");
                    const slash = url.indexOf("/");

                    if (
                      // If there is no protocol, it’s relative.
                      colon < 0 ||
                      // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
                      (slash > -1 && colon > slash) ||
                      (questionMark > -1 && colon > questionMark) ||
                      (numberSign > -1 && colon > numberSign) ||
                      // It is a protocol, it should be allowed.
                      safeProtocol.test(url.slice(0, colon))
                    ) {
                      return url;
                    }
                    return "";
                  }}
                  components={{
                    // open external links in new tab
                    a: ({ ...props }) => (
                      <a href={props.href} target="_blank" rel="noreferrer">
                        {props.children}
                      </a>
                    ),
                  }}
                >
                  {featureMetaData?.feature?.description ?? ""}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}

          {selectedFeature?.feature?.isDraft ? (
            <Callout.Root
              color="indigo"
              size="1"
              className="block py-1.5 px-3 mt-2 mb-4"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-sm">
                  <TbEyeSearch className="inline-block mr-1 mb-0.5" />
                  {selectedFeature.feature?.isInactive
                    ? "Previewing inactive revision"
                    : "Previewing draft"}
                </div>
                <Link
                  size="1"
                  href="#"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    changeRevision({ num: null });
                  }}
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
                valueType={
                  featureMetaData?.feature?.valueType ??
                  selectedFeature?.valueType
                }
              />
            ) : null}
          </div>

          <div className="mt-6 mb-2 py-1 border-b border-gray-a6">
            <div className="flex justify-between items-end text-md font-semibold">
              <div>Rules and Values</div>
              <label className="flex gap-1 text-xs items-center font-normal select-none cursor-pointer flex-shrink-0">
                <span>Hide inactive rules</span>
                <Switch
                  size="1"
                  checked={hideInactiveRules}
                  onCheckedChange={(b) => setHideInactiveRules(b)}
                />
              </label>
            </div>
            {selectedFid && featureMetaData?.feature?.revisions ? (
              <RevisionSelector
                sdkRevision={sdkRevisionByFid?.[selectedFid]}
                revisions={revisionsByFid[selectedFid] ?? []}
                revisionNum={revisionNumByFid?.[selectedFid] ?? null}
                revisionEnvs={revisionEnvsByFid?.[selectedFid] ?? null}
                revisionEnv={revisionEnvByFid?.[selectedFid] ?? null}
                setRevisionNum={(num) => changeRevision({ num })}
                setRevisionEnv={(env) => changeRevision({ env })}
                noDefinition={selectedFeature?.feature?.noDefinition}
                fetchRevisionType={fetchRevisionType}
                setFetchRevisionType={setFetchRevisionType}
              />
            ) : null}
          </div>

          {!hideInactiveRules || defaultValueStatus === "matches" ? (
            <div
              className={`rule relative ${defaultValueStatus}`}
              style={{ padding: "12px 12px 12px 14px" }}
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

              {!selectedFeature.feature?.noDefinition ? (
                <Accordion.Root
                  className="accordion mt-2"
                  type="single"
                  collapsible
                >
                  <Accordion.Item value="feature-definition">
                    <Accordion.Trigger className="trigger mb-0.5">
                      <Link size="2" role="button" className="hover:underline">
                        <PiCaretRightFill className="caret mr-0.5" size={12} />
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
              ) : null}
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
  revisionEnvs,
  revisionEnv,
  setRevisionNum,
  setRevisionEnv,
  noDefinition = false,
  fetchRevisionType,
  setFetchRevisionType,
}: {
  sdkRevision?: SelectedFeatureWithMeta;
  revisions: Revision[];
  revisionNum: number | null;
  revisionEnvs: string[] | null;
  revisionEnv: string | null;
  setRevisionNum: (n: number | null) => void;
  setRevisionEnv: (s: string | null) => void;
  noDefinition?: boolean;
  fetchRevisionType: "drafts" | "all";
  setFetchRevisionType: (t: "drafts" | "all") => void;
}) {
  const liveRevisionNum = sdkRevision?.version;
  const revision = revisions.find((r) => r.version === revisionNum);

  const drawLiveRevisionRow = () => {
    return (
      <div className="flex justify-between w-full">
        <span>
          {liveRevisionNum !== undefined
            ? `SDK revision ${liveRevisionNum}`
            : "SDK revision"}
        </span>
        {!noDefinition && (
          <Badge size="1" className="text-2xs" color="teal" ml="3">
            live
          </Badge>
        )}
      </div>
    );
  };
  const drawRevisionRow = (revision: Revision) => {
    const revisionStatus =
      revision?.status === "published"
        ? revision?.version === sdkRevision?.version
          ? "live"
          : "inactive"
        : revision?.status && revision?.status !== "discarded"
          ? "draft"
          : "inactive";
    const revisionStatusColor =
      revisionStatus === "draft"
        ? "indigo"
        : revisionStatus === "live"
          ? "teal"
          : "gray";
    return (
      <div className="flex justify-between w-full">
        <span>Revision {revision.version}</span>
        <Badge size="1" className="text-2xs" color={revisionStatusColor} ml="3">
          {revisionStatus}
        </Badge>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-x-4 gap-y-1 justify-between flex-wrap mt-3 mb-1">
      <div>
        <Select.Root
          size="1"
          value={JSON.stringify(revisionNum)}
          onValueChange={(v) => {
            setRevisionNum(v !== "null" ? parseInt(v) : null);
          }}
        >
          <Select.Trigger>
            <div className="w-[140px] overflow-hidden overflow-ellipsis">
              {revision ? drawRevisionRow(revision) : drawLiveRevisionRow()}
            </div>
          </Select.Trigger>
          <Select.Content variant="soft">
            <Select.Item value="null">
              <div className="w-[140px] overflow-hidden overflow-ellipsis">
                {drawLiveRevisionRow()}
              </div>
            </Select.Item>
            {revisions.length ? (
              <>
                <Select.Separator/>
                {revisions.map((r) => (
                  <Select.Item value={r.version + ""} key={r.version}>
                    <div className="w-[140px] overflow-hidden overflow-ellipsis">
                      {drawRevisionRow(r)}
                    </div>
                  </Select.Item>
                ))}
              </>
            ) : (
              <div className="px-5 pt-2 text-xs text-gray-10 italic">
                No other revisions
              </div>
            )}
            <div className="flex justify-end px-5 mt-2.5 mb-1.5">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button variant="ghost" size="1">
                    <PiFunnelBold />
                    {fetchRevisionType === "drafts" ? "Drafts" : "All revisions"}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content variant="soft" size="1" side="right">
                  <DropdownMenu.Item
                    onSelect={() => setFetchRevisionType("drafts")}
                  >
                    Fetch drafts only
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => setFetchRevisionType("all")}>
                    Fetch all revisions
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
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
              <div className="min-w-[70px] max-w-[150px] overflow-hidden overflow-ellipsis">
                {revisionEnv}
              </div>
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
          <div className="rt-reset rt-SelectTrigger rt-r-size-1 rt-variant-surface bg-gray-a1 text-gray-11">
            {!noDefinition ? "using SDK definition" : "unknown"}
          </div>
        )}
      </div>
    </div>
  );
}
