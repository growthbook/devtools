import type {
  Experiment,
  FeatureDefinition,
  ExperimentOverride,
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

export type DebugLogs = [string, any][];

export type CopyMode = "energetic" | "concise" | "humorous";

export type CSPError = {
  violatedDirective: string;
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
  }
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
  | UpdateTabState;

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

type SDKHealthCheckResult = {
  canConnect: boolean;
  hasPayload: boolean;
  hasClientKey?: boolean;
  errorMessage?: string;
  version?: string;
  sdkFound: boolean;
  clientKey?: string;
  isLoading?: boolean;
  payload?: Record<string, any>;
};

type BGSetSDKUsageData = {
  type: "GB_SDK_UPDATED";
  data: SDKHealthCheckResult & { tabId?: number };
}

type GBGetStateMessage = {
  type: "GB_GET_STATE";
  property: string;
}


// Messages sent to background script
export type BGMessage =
  | BGLoadVisualChangsetMessage
  | BGUpdateVisualChangsetMessage
  | BGTransformCopyMessage
  | BGSetSDKUsageData
  | GBGetStateMessage;
