import React, { useEffect, useState } from "react";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGlobalState from "../hooks/useGlobalState";
import {
  Button,
  Checkbox,
  Container,
  Flex,
  Link,
  Text,
} from "@radix-ui/themes";
import { Archetype, SDKAttribute, SDKAttributeType } from "../tempGbExports";
import AttributesForm from "./AttributesForm";
import { useForm } from "react-hook-form";
import { PiX, PiXBold } from "react-icons/pi";
import useApi from "../hooks/useApi";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "./Settings";
import clsx from "clsx";
import { MW } from "@/app";
import { useResponsiveContext } from "../hooks/useResponsive";

export const HEADER_H = 40;

export default function AttributesTab() {
  const { isResponsive } = useResponsiveContext();
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const attributesForm = useForm<Attributes>({ defaultValues: attributes });
  const formAttributes = attributesForm.getValues();
  const formAttributesString = JSON.stringify(formAttributes, null, 2);
  const [textareaAttributes, setTextareaAttributes] =
    useState(formAttributesString);
  const [textareaError, setTextareaError] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [jsonMode, setJsonMode] = useTabState(
    "attributesForm_useJsonMode",
    false,
  );
  const [forcedAttributes, setForcedAttributes] = useTabState<boolean>(
    "forcedAttributes",
    false,
  );
  const [newAppliedAttributeIds, setNewAppliedAttributeIds] = useTabState<
    string[]
  >("newAppliedAttributeIds", []);

  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);

  const [archetypes, setArchetypes] = useGlobalState<Archetype[]>(
    "allArchetypes",
    [],
    true,
  );
  const {
    isLoading: archetypesLoading,
    error: archetypesError,
    data: archetypesData,
  } = useApi<{ archetypes: Archetype[] }>("/api/v1/archetypes");

  useEffect(() => {
    if (archetypesLoading || archetypesError || !archetypesData) return;
    setArchetypes(
      archetypes
        .filter((arch) => arch.source === "local")
        .concat(
          (archetypesData.archetypes || []).map((arch) => ({
            ...arch,
            source: "growthbook",
          })),
        ),
    );
  }, [archetypesLoading, archetypesError, archetypesData]);

  const [attributeSchema, setAttributeSchema] = useGlobalState<
    Record<string, SDKAttribute>
  >("attributeSchema", {}, true);

  const {
    isLoading: attributesLoading,
    error: attributesError,
    data: attributesData,
  } = useApi<{ attributes: SDKAttribute[] }>("/api/v1/attributes");

  useEffect(() => {
    if (attributesLoading || attributesError || !attributesData) return;
    setAttributeSchema(
      Object.fromEntries(
        (attributesData.attributes || []).map((attr) => [attr.property, attr]),
      ),
    );
  }, [attributesLoading, attributesError, attributesData]);

  const [selectedArchetype, setSelectedArchetype] =
    useTabState<Archetype | null>("selectedArchetype", null);
  const applyAttributes = (newAttributes: Attributes | undefined) => {
    if (!jsonMode) {
      // check to see if the two objects are the same to avoid unnecessary updates
      newAttributes = newAttributes || (formAttributes as Attributes);
    } else {
      try {
        newAttributes = JSON.parse(textareaAttributes);
        if (!newAttributes || typeof newAttributes !== "object") {
          throw new Error("invalid type");
        }
      } catch (e) {
        setTextareaError(true);
        return;
      }
    }
    const newOverriddenAttributes = Object.fromEntries(
      Object.keys(newAttributes)
        .filter((key: string) => {
          return (
            JSON.stringify(newAttributes[key]) !==
            JSON.stringify(attributes[key])
          );
        })
        .map((key: string) => {
          if (!attributes.hasOwnProperty(key)) {
            setNewAppliedAttributeIds([...newAppliedAttributeIds, key]);
          }
          return [key, newAttributes[key]];
        }),
    );
    // check if newAttributes has any keys that are removed from attributes
    Object.keys(attributes).forEach((key) => {
      (key: string) => {
        if (!newAttributes.hasOwnProperty(key)) {
          setNewAppliedAttributeIds(
            newAppliedAttributeIds.filter((id) => id !== key),
          );
        }
      };
    });
    if (Object.keys(newOverriddenAttributes).length > 0) {
      setForcedAttributes(true);
      setSelectedArchetype(null);
      setAttributes({ ...attributes, ...newOverriddenAttributes });
    } else if (Object.keys(newAttributes).length === 0) {
      setSelectedArchetype(null);
      setForcedAttributes(false);
    }
    attributesForm.reset({ ...attributes, ...newAttributes });
    setDirty(false);
  };

  const resetAttributesOverride = () => {
    setForcedAttributes(false);
    setNewAppliedAttributeIds([]);
    setSelectedArchetype(null);
    setAttributes({});
    setDirty(false); // we want to wait for the next render to reset with the initial attributes
  };

  // listen to SDK changes to set attributes form
  useEffect(() => {
    if (!dirty) {
      attributesForm.reset(attributes);
    }
  }, [JSON.stringify(attributes)]);

  return (
    <>
      <div
        id="attributesTab"
        className="mx-auto"
        style={{
          maxWidth: 700,
          overflowX: "hidden",
        }}
      >
        <div
          className={clsx(
            "mx-auto fixed w-full flex items-center justify-between border-b border-b-slate-4 bg-white text-xs font-semibold shadow-sm",
            {
              "pl-4 pr-6": !isResponsive,
              "pl-2 pr-3": isResponsive,
            },
          )}
          style={{
            maxWidth: 700,
            height: HEADER_H,
            zIndex: 2000,
          }}
        >
          <Text
            my="2"
            weight="medium"
            color="gray"
            size="1"
            className={clsx("uppercase", { "px-2": isResponsive })}
          >
            User Attributes
          </Text>
          <div className="flex flex-shrink-1 items-center justify-end gap-3">
            {forcedAttributes && !selectedArchetype && (
              <Link
                href="#"
                role="button"
                color="amber"
                size="1"
                onClick={(e) => {
                  e.preventDefault();
                  resetAttributesOverride();
                }}
                className="flex gap-1 items-center font-normal leading-3 text-right"
              >
                Clear overrides
                <PiXBold className="flex-shrink-0" />
              </Link>
            )}
            <label className="flex flex-shrink-1 items-center text-xs cursor-pointer leading-3 select-none">
              <Checkbox
                checked={jsonMode}
                onCheckedChange={() => setJsonMode(!jsonMode)}
                size="1"
                mr="1"
                className="cursor-pointer"
              />
              <span>JSON input</span>
            </label>
          </div>
        </div>

        <div
          className={clsx("flex justify-between items-top h-[100%] mx-auto", {
            "px-4": !isResponsive,
          })}
          style={{ maxWidth: 700 }}
        >
          <div className="w-full">
            <div
              className={clsx("attributesForm", {
                "px-3": !isResponsive,
                "rounded-md": !isResponsive,
                "rounded-none": isResponsive,
                "px-2": isResponsive,
              })}
              style={{ marginTop: HEADER_H + (!isResponsive ? 12 : 0) }}
            >
              <Container className="p-3" overflowX="hidden">
                <AttributesForm
                  form={attributesForm}
                  dirty={dirty}
                  setDirty={setDirty}
                  jsonMode={jsonMode}
                  textareaAttributes={textareaAttributes}
                  setTextareaAttributes={setTextareaAttributes}
                  textareaError={textareaError}
                  setTextareaError={setTextareaError}
                  schema={attributeSchema}
                  saveOnBlur={applyAttributes}
                />
              </Container>
            </div>
            <div className="h-1" />
          </div>
        </div>
      </div>
    </>
  );
}
