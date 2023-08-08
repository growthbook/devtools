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
