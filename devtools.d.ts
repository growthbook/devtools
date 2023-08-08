import type {
  Experiment,
  FeatureDefinition,
  ExperimentOverride,
} from "@growthbook/growthbook";

export type DebugLogs = [string, any][];

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

type ApiCredsRequest = {
  type: "GB_REQUEST_API_CREDS";
};

type ApiCredsResponse = {
  type: "GB_RESPONSE_API_CREDS";
  apiKey: string | null;
};

type OpenVisualEditorRequestMessage = {
  type: "GB_REQUEST_OPEN_VISUAL_EDITOR";
  data: string;
};

type OpenVisualEditorResponseMessage = {
  type: "GB_RESPONSE_OPEN_VISUAL_EDITOR";
  data: string;
};

export type BackgroundFetchVisualChangsetMessage = {
  type: "GET_VISUAL_CHANGESET";
  data: {
    apiHost: string;
    visualChangesetId: string;
  };
};

type LoadVisualChangesetRequestMessage = {
  type: "GB_REQUEST_LOAD_VISUAL_CHANGESET";
  data: string;
};

type LoadVisualChangesetResponseMessage = {
  type: "GB_RESPONSE_LOAD_VISUAL_CHANGESET";
  data: string;
};

export type Message =
  | RequestRefreshMessage
  | SetOverridesMessage
  | RefreshMessage
  | ErrorMessage
  | ApiCredsRequest
  | ApiCredsResponse
  | OpenVisualEditorRequestMessage
  | OpenVisualEditorResponseMessage
  | LoadVisualChangesetRequestMessage
  | LoadVisualChangesetResponseMessage;

export interface ApiCreds {
  apiKey: string;
  apiHost: string;
}

export interface VisualChangesetApiResponse {
  visualChangeset: {
    id?: string;
    urlPatterns: {
      include?: boolean;
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
        parentSelector?: string;
        insertBeforeSelector?: string;
      }[];
    }[];
  };
  experiment: {
    id: string;
    dateCreated: string;
    dateUpdated: string;
    name: string;
    project: string;
    hypothesis: string;
    description: string;
    tags: string[];
    owner: string;
    archived: boolean;
    status: string;
    autoRefresh: boolean;
    hashAttribute: string;
    variations: {
      variationId: string;
      key: string;
      name: string;
      description: string;
      screenshots: string[];
    }[];
    resultSummary?: {
      status: string;
      winner: string;
      conclusions: string;
      releasedVariationId: string;
      excludeFromPayload: boolean;
    };
  };
  error: null;
}
