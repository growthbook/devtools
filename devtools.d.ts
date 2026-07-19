import {
  Experiment,
  FeatureDefinition,
  ExperimentOverride,
  StickyAssignmentsDocument,
  FeatureApiResponse,
  Attributes,
} from "@growthbook/growthbook";
import {
  FetchVisualChangesetPayload,
  TransformCopyPayload,
  UpdateVisualChangesetPayload,
} from "@/background/visualEditorHandlers";

declare global {
  interface Window {
    __gb_global_js_err?: (error: string) => void;
  }
}

export type DebugLog = [string, any];

export type CopyMode = "energetic" | "concise" | "humorous";

export type CSPError = {
  violatedDirective: string;
  effectiveDirective?: string;
  blockedURI?: string;
  sourceFile?: string;
  isFatal?: boolean;
  timestamp?: number;
};

export interface VisualEditorVariation {
  name: string;
  description: string;
  css?: string;
  js?: string;
  domMutations: APIDomMutation[];
  variationId: string;
}

export interface APIExperiment {
  id: string;
  hashAttribute: string;
  variations: {
    variationId: string;
    key: string;
    name: string;
    description: string;
    screenshots: string[];
  }[];
}
export type APIExperimentVariation = APIExperiment["variations"][number];

export interface APIVisualChangeset {
  id: string;
  urlPatterns: {
    include: boolean;
    /** @enum {string} */
    type: "simple" | "regex";
    pattern: string;
  }[];
  editorUrl: string;
  experiment: string;
  visualChanges: {
    description?: string;
    css?: string;
    js?: string;
    variation: string;
    domMutations: {
      selector: string;
      /** @enum {string} */
      action: "append" | "set" | "remove";
      attribute: string;
      value?: string;
    }[];
  }[];
}

export type APIVisualChange = APIVisualChangeset["visualChanges"][number];
export type APIDomMutation = APIVisualChange["domMutations"][number];

export type RequestRefreshMessage = {
  type: "GB_REQUEST_REFRESH";
};

export type InjectSdkMessage = {
  type: "GB_INJECT_SDK";
  clientKey: string;
  apiHost: string;
  autoInject: boolean;
};
export type ClearInjectedSdkMessage = {
  type: "GB_CLEAR_INJECTED_SDK";
};

export type SetOverridesMessage = {
  type: "GB_SET_OVERRIDES";
  variations: Record<string, number>;
  features: Record<string, any>;
  attributes: Record<string, any>;
};

export type RefreshMessage = {
  type: "GB_REFRESH";
  features: Record<string, FeatureDefinition>;
  experiments: Record<string, Experiment<any>>;
  attributes: Record<string, any>;
  overrides: Record<string, ExperimentOverride>;
  url: string;
  clientKey: string;
  apiHost: string;
};

export type ErrorMessage = {
  type: "GB_ERROR";
  error: string;
};

type OpenVisualEditorRequestMessage = {
  type: "GB_REQUEST_OPEN_VISUAL_EDITOR";
  data: {
    apiHost: string;
    apiKey: string;
  };
};

type OpenVisualEditorResponseMessage = {
  type: "GB_RESPONSE_OPEN_VISUAL_EDITOR";
  data: string;
};

type LoadVisualChangesetRequestMessage = {
  type: "GB_REQUEST_LOAD_VISUAL_CHANGESET";
  data: {
    visualChangesetId: string;
  };
};

type LoadVisualChangesetResponseMessage = {
  type: "GB_RESPONSE_LOAD_VISUAL_CHANGESET";
  data: FetchVisualChangesetPayload;
};

type UpdateVisualChangesetRequestMessage = {
  type: "GB_REQUEST_UPDATE_VISUAL_CHANGESET";
  data: {
    visualChangesetId: string;
    updatePayload: Partial<APIVisualChangeset>;
  };
};

type UpdateVisualChangesetResponseMessage = {
  type: "GB_RESPONSE_UPDATE_VISUAL_CHANGESET";
  data: UpdateVisualChangesetPayload;
};

type TransformCopyRequestMessage = {
  type: "GB_REQUEST_TRANSFORM_COPY";
  data: {
    visualChangesetId: string;
    copy: string;
    mode: CopyMode;
  };
};

type TransformCopyResponseMessage = {
  type: "GB_RESPONSE_TRANSFORM_COPY";
  data: TransformCopyPayload;
};

type UpdateTabState = {
  append?: boolean;
  type: "UPDATE_TAB_STATE";
  data: {
    property: string;
    value: unknown;
    tabId: number;
  };
};

type PullOverrides = {
  type: "GB_REQUEST_OVERRIDES";
};

type SetPayload = {
  type: "SET_PAYLOAD";
  data: FeatureApiResponse;
};

type PatchPayload = {
  type: "PATCH_PAYLOAD";
  data: FeatureApiResponse;
};

type CopyToClipboard = {
  type: "COPY_TO_CLIPBOARD";
  value: string;
};

// Legacy visual editor deprecation: the injected editor asks the content
// script whether to show the "install the new extension" notice before
// rendering, and reports the user's "keep using the legacy editor" choice.
type VeDeprecationStatusRequestMessage = {
  type: "GB_REQUEST_VE_DEPRECATION_STATUS";
};

type VeDeprecationStatusResponseMessage = {
  type: "GB_RESPONSE_VE_DEPRECATION_STATUS";
  data: {
    showNotice: boolean;
    isFirefox: boolean;
  };
};

type VeDeprecationDismissMessage = {
  type: "GB_DISMISS_VE_DEPRECATION";
};

// Messages sent to content script
export type Message =
  | RequestRefreshMessage
  | SetOverridesMessage
  | RefreshMessage
  | ErrorMessage
  | OpenVisualEditorRequestMessage
  | OpenVisualEditorResponseMessage
  | LoadVisualChangesetRequestMessage
  | LoadVisualChangesetResponseMessage
  | UpdateVisualChangesetRequestMessage
  | UpdateVisualChangesetResponseMessage
  | TransformCopyRequestMessage
  | TransformCopyResponseMessage
  | UpdateTabState
  | PullOverrides
  | SetPayload
  | PatchPayload
  | InjectSdkMessage
  | ClearInjectedSdkMessage
  | CopyToClipboard
  | VeDeprecationStatusRequestMessage
  | VeDeprecationStatusResponseMessage
  | VeDeprecationDismissMessage;

export type BGLoadVisualChangsetMessage = {
  type: "BG_LOAD_VISUAL_CHANGESET";
  data: {
    visualChangesetId: string;
  };
};

export type BGUpdateVisualChangsetMessage = {
  type: "BG_UPDATE_VISUAL_CHANGESET";
  data: {
    visualChangesetId: string;
    updatePayload: Partial<APIVisualChangeset>;
  };
};

export type BGTransformCopyMessage = {
  type: "BG_TRANSFORM_COPY";
  data: {
    visualChangesetId: string;
    copy: string;
    mode: CopyMode;
  };
};

export type ExternalSdkInfo = {
  apiHost: string;
  clientKey: string;
  version?: string;
  payload?: FeatureApiResponse;
  attributes?: Attributes;
};

export type SDKHealthCheckResult = {
  canConnect: boolean;
  hasPayload: boolean;
  hasClientKey?: boolean;
  errorMessage?: string;
  version?: string;
  hasWindowConfig?: boolean;
  sdkFound?: boolean;
  externalSdks?: Record<string, ExternalSdkInfo>;
  clientKey?: string;
  isLoading?: boolean;
  payload?: Record<string, any>;
  devModeEnabled: boolean;
  hasTrackingCallback?: boolean;
  trackingCallbackParams?: string[];
  hasDecryptionKey?: boolean;
  payloadDecrypted?: boolean;
  usingLogEvent?: boolean;
  usingOnFeatureUsage?: boolean;
  isRemoteEval?: boolean;
  usingStickyBucketing?: boolean;
  stickyBucketAssignmentDocs?: Record<string, StickyAssignmentsDocument>;
  streaming?: boolean;
  apiHost?: string;
  streamingHost?: string;
  apiRequestHeaders?: Record<string, string>;
  streamingHostRequestHeaders?: Record<string, string>;
};

type BGSetSDKUsageData = {
  type: "GB_SDK_UPDATED";
  data: SDKHealthCheckResult & { tabId?: number };
};

// data is unused for these two; declared so the background router's
// `const { type, data } = message` destructuring stays valid on the union.
export type BGGetVeDeprecationStatusMessage = {
  type: "BG_GET_VE_DEPRECATION_STATUS";
  data?: undefined;
};

export type BGDismissVeDeprecationMessage = {
  type: "BG_DISMISS_VE_DEPRECATION";
  data?: undefined;
};

export type VeDeprecationStatus = {
  newExtensionInstalled: boolean;
  dismissed: boolean;
  isFirefox: boolean;
};

// Messages sent to background script
export type BGMessage =
  | BGLoadVisualChangsetMessage
  | BGUpdateVisualChangsetMessage
  | BGTransformCopyMessage
  | BGSetSDKUsageData
  | BGGetVeDeprecationStatusMessage
  | BGDismissVeDeprecationMessage;
