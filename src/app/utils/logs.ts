import { LogUnion } from "@growthbook/growthbook";

export interface FlattenedLogEvent {
  timestamp: string;
  logType: string;
  eventInfo: string;
  details: Record<string, unknown>;
}
export type LogType = LogUnion["logType"];

export function reshapeEventLog(evt: LogUnion): FlattenedLogEvent {
  switch (evt.logType) {
    case "debug":
      return {
        timestamp: evt.timestamp,
        logType: evt.logType,
        eventInfo: evt.debug.msg,
        details: {
          context: evt.debug.ctx,
        },
      };
    case "event":
      return {
        timestamp: evt.timestamp,
        logType: evt.logType,
        eventInfo: evt.eventName,
        details: {
          properties: evt.properties,
        },
      };
    case "experiment":
      return {
        timestamp: evt.timestamp,
        logType: evt.logType,
        eventInfo: evt.experiment.name || "",
        details: {
          experiment: evt.experiment,
          result: evt.result,
        },
      };
    case "feature":
      return {
        timestamp: evt.timestamp,
        logType: evt.logType,
        eventInfo: evt.featureKey,
        details: {
          featureKey: evt.featureKey,
          result: evt.result,
        },
      };
  }
}
