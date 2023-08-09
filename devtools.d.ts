import type {
  Experiment,
  FeatureDefinition,
  ExperimentOverride,
} from "@growthbook/growthbook";

export type DebugLogs = [string, any][];

export type CopyMode = "energetic" | "concise" | "humorous";

export interface APIExperiment {
  id: string;
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
    include?: boolean;
    /** @enum {string} */
    type: "simple" | "exact" | "regex";
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

export interface ApiUpdateVisualChangesetResponse {
  nModified: number;
  error: string | null;
}

export type ApiTransformCopyResponse =
  | {
      transformed: string;
      dailyLimitReached: boolean;
      error: null;
    }
  | {
      transformed: null;
      dailyLimitReached: null;
      error: string;
    };

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
};

export type ErrorMessage = {
  type: "GB_ERROR";
  error: string;
};

type OpenVisualEditorRequestMessage = {
  type: "GB_REQUEST_OPEN_VISUAL_EDITOR";
  data: string;
};

type OpenVisualEditorResponseMessage = {
  type: "GB_RESPONSE_OPEN_VISUAL_EDITOR";
  data: string;
};

type LoadVisualChangesetRequestMessage = {
  type: "GB_REQUEST_LOAD_VISUAL_CHANGESET";
  data: {
    apiHost: string;
    visualChangesetId: string;
  };
};

type LoadVisualChangesetResponseMessage = {
  type: "GB_RESPONSE_LOAD_VISUAL_CHANGESET";
  data: ApiLoadVisualChangesetResponse;
};

type UpdateVisualChangesetRequestMessage = {
  type: "GB_REQUEST_UPDATE_VISUAL_CHANGESET";
  data: {
    apiHost: string;
    visualChangesetId: string;
    updatePayload: Partial<APIVisualChangeset>;
  };
};

type UpdateVisualChangesetResponseMessage = {
  type: "GB_RESPONSE_UPDATE_VISUAL_CHANGESET";
  data: ApiUpdateVisualChangesetResponse;
};

type TransformCopyRequestMessage = {
  type: "GB_REQUEST_TRANSFORM_COPY";
  data: {
    apiHost: string;
    copy: string;
    mode: CopyMode;
  };
};

type TransformCopyResponseMessage = {
  type: "GB_RESPONSE_TRANSFORM_COPY";
  data: ApiTransformCopyResponse;
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
  | TransformCopyResponseMessage;

/**
 * Messages sent to background script
 */
export type BGLoadVisualChangsetMessage = {
  type: "BG_LOAD_VISUAL_CHANGESET";
  data: {
    apiHost: string;
    visualChangesetId: string;
  };
};

export type BGUpdateVisualChangsetMessage = {
  type: "BG_UPDATE_VISUAL_CHANGESET";
  data: {
    apiHost: string;
    visualChangesetId: string;
    updatePayload: Partial<APIVisualChangeset>;
  };
};

export type BGTransformCopyMessage = {
  type: "BG_TRANSFORM_COPY";
  data: {
    apiHost: string;
    copy: string;
    mode: CopyMode;
  };
};

export type BGMessage =
  | BGLoadVisualChangsetMessage
  | BGUpdateVisualChangsetMessage
  | BGTransformCopyMessage;
