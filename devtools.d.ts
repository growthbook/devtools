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

type EnableVisualEditorMessage = {
  type: "GB_ENABLE_VISUAL_EDITOR";
};

type DisableVisualEditorMessage = {
  type: "GB_DISABLE_VISUAL_EDITOR";
};

type ApiCredsRequest = {
  type: "GB_REQUEST_API_CREDS";
};

type ApiCredsResponse = {
  type: "GB_RESPONSE_API_CREDS";
  apiKey: string | null;
};

type OpenVisualEditorMessage = {
  type: "GB_OPEN_VISUAL_EDITOR";
  data: string;
};

export type Message =
  | RequestRefreshMessage
  | SetOverridesMessage
  | RefreshMessage
  | ErrorMessage
  | ApiCredsRequest
  | ApiCredsResponse
  | EnableVisualEditorMessage
  | DisableVisualEditorMessage
  | OpenVisualEditorMessage;

export interface ApiCreds {
  apiKey: string;
  apiHost: string;
}
