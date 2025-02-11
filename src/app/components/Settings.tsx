import React, { useEffect } from "react";
import * as Form from "@radix-ui/react-form";
import useGlobalState from "@/app/hooks/useGlobalState";
import { useForm } from "react-hook-form";
import { Button, Checkbox } from "@radix-ui/themes";

const NAMESPACE = "devtools";
const VERSION = "v1";
export const API_HOST = `${NAMESPACE}-${VERSION}-api-host`;
export const APP_ORIGIN = `${NAMESPACE}-${VERSION}-app-origin`;
export const API_KEY = `${NAMESPACE}-${VERSION}-api-key`;
export const CLOUD_API_HOST = "https://api.growthbook.io";
export const CLOUD_APP_ORIGIN = "https://app.growthbook.io";

const SettingsForm = ({ close }: { close?: () => void }) => {
  const [apiHost, setApiHost, apiHostReady] = useGlobalState(
    API_HOST,
    CLOUD_API_HOST,
    true,
  );
  const [appOrigin, setAppOrigin, appOriginReady] = useGlobalState(
    APP_ORIGIN,
    CLOUD_APP_ORIGIN,
    true,
  );
  const [apiKey, setApiKey, apiKeyReady] = useGlobalState(API_KEY, "", true);
  const ready = apiHostReady && appOriginReady && apiKeyReady;

  const form = useForm({
    defaultValues: {
      apiHost,
      appOrigin,
      apiKey,
      isCloud: true, // local form-control state
    },
  });
  const submitForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const values = form.getValues();
    setApiHost(values.apiHost);
    setAppOrigin(values.appOrigin);
    setApiKey(values.apiKey);
    close?.();
  };

  useEffect(() => {
    if (apiHostReady && apiKeyReady) {
      form.setValue("apiHost", apiHost);
      form.setValue("appOrigin", appOrigin);
      form.setValue("apiKey", apiKey);
      form.setValue(
        "isCloud",
        apiHost === CLOUD_API_HOST && appOrigin === CLOUD_APP_ORIGIN,
      );
    }
  }, [ready]);

  useEffect(() => {
    if (
      form.watch("apiHost") !== CLOUD_API_HOST ||
      form.watch("appOrigin") !== CLOUD_APP_ORIGIN
    ) {
      form.setValue("isCloud", false);
    }
  }, [form.watch("apiHost"), form.watch("appOrigin")]);

  return (
    <Form.Root className="FormRoot" onSubmit={submitForm}>
      <Form.Field className="FormField" name={API_KEY}>
        <Form.Label className="FormLabel">GrowthBook Access Token</Form.Label>
        <Form.Control asChild>
          <input className="Input" {...form.register("apiKey")} />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormFieldInline" name="isCloud">
        <Form.Control asChild>
          <Checkbox
            checked={form.watch("isCloud")}
            onCheckedChange={(v: boolean) => {
              form.setValue("isCloud", v);
              if (v) {
                form.setValue("apiHost", CLOUD_API_HOST);
                form.setValue("appOrigin", CLOUD_APP_ORIGIN);
              }
            }}
            size="3"
            mr="2"
          />
        </Form.Control>
        <Form.Label className="FormLabel cursor-pointer">
          GrowthBook Cloud
        </Form.Label>
      </Form.Field>

      {!form.watch("isCloud") && (
        <>
          <Form.Field className="FormField" name={API_HOST}>
            <Form.Label className="FormLabel">GrowthBook API Host</Form.Label>
            <Form.Control asChild>
              <input className="Input" {...form.register("apiHost")} />
            </Form.Control>
          </Form.Field>

          <Form.Field className="FormField" name={APP_ORIGIN}>
            <Form.Label className="FormLabel">GrowthBook App Origin</Form.Label>
            <Form.Control asChild>
              <input className="Input" {...form.register("appOrigin")} />
            </Form.Control>
          </Form.Field>
        </>
      )}

      <div className="mt-8">
        <Form.Submit asChild>
          <Button size="3" className="w-full">
            Save
          </Button>
        </Form.Submit>
      </div>
    </Form.Root>
  );
};

export default SettingsForm;
