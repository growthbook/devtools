import { Attributes } from "@growthbook/growthbook";

export const attributeDataTypes = [
  "boolean",
  "string",
  "number",
  "secureString",
  "enum",
  "string[]",
  "number[]",
  "secureString[]",
] as const;

export const primitiveDataTypes = [
  "boolean",
  "string",
  "number",
  "string[]",
  "number[]",
] as const;

export type SDKAttributeType = (typeof attributeDataTypes)[number];
export type SDKAttributeFormat = "" | "version" | "date" | "isoCountryCode";

export type SDKAttribute = {
  property: string;
  datatype: SDKAttributeType;
  description?: string;
  hashAttribute?: boolean;
  enum?: string;
  archived?: boolean;
  format?: SDKAttributeFormat;
  projects?: string[];
};
export type SDKAttributeSchema = SDKAttribute[];

export type ArchetypeSource = "growthbook" | "local";
export interface Archetype {
  id: string;
  name: string;
  attributes: Attributes;
  source: ArchetypeSource;
}
