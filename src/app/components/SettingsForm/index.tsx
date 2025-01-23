import React, {useEffect} from "react";
import * as Form from "@radix-ui/react-form";
import "./style.css";
import useGlobalState from "@/app/hooks/useGlobalState";
import {useForm} from "react-hook-form";
import {Button} from "@radix-ui/themes";

const NAMESPACE = "devtools";
const VERSION = "v1";
export const API_HOST = `${NAMESPACE}-${VERSION}-api-host`;
export const API_KEY = `${NAMESPACE}-${VERSION}-api-key`;

const SettingsForm = ({
  close,
}: {
  close?: () => void;
}) => {
  const [apiHost, setApiHost, apiHostReady] = useGlobalState(API_HOST, "", true);
  const [apiKey, setApiKey, apiKeyReady] = useGlobalState(API_KEY, "", true);
  const ready = apiHostReady && apiKeyReady;

  const form = useForm({
    defaultValues: {
      apiHost,
      apiKey
    }
  });
  const submitForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const values = form.getValues();
    setApiHost(values.apiHost);
    setApiKey(values.apiKey);
    close?.();
  }

  useEffect(() => {
    if (apiHostReady && apiKeyReady) {
      form.setValue("apiHost", apiHost)
      form.setValue("apiKey", apiKey)
    }
  }, [ready]);

  return (
    <Form.Root className="FormRoot" onSubmit={submitForm}>
      <Form.Field className="FormField" name={API_KEY}>
        <Form.Label className="FormLabel">GrowthBook Access Token</Form.Label>
        <Form.Control asChild>
          <input className="Input" {...form.register("apiKey")} />
        </Form.Control>
      </Form.Field>
      <Form.Field className="FormField" name={API_HOST}>
        <Form.Label className="FormLabel">GrowthBook API Host</Form.Label>
        <Form.Control asChild>
          <input className="Input" {...form.register("apiHost")} />
        </Form.Control>
      </Form.Field>

      <Form.Submit asChild>
        <Button size="3" className="w-100">Save</Button>
      </Form.Submit>
    </Form.Root>
  )
};

export default SettingsForm;
