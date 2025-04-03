import React, { useEffect } from "react";
import * as Form from "@radix-ui/react-form";
import useGlobalState from "@/app/hooks/useGlobalState";
import { useForm } from "react-hook-form";
import { Button, Checkbox, Link } from "@radix-ui/themes";
import useTabState from "@/app/hooks/useTabState";
import { API_HOST, CLOUD_API_HOST } from "./Settings";

const InjectSdkForm = ({
  close,
  injectSdk,
}: {
  close: () => void;
  injectSdk: ({
    apiHost,
    clientKey,
    autoInject,
  }: {
    apiHost: string;
    clientKey: string;
    autoInject: boolean;
  }) => Promise<void>;
}) => {
  const [apiHost, setApiHost, apiHostReady] = useGlobalState(
    API_HOST,
    CLOUD_API_HOST,
    true,
  );
  const [sdkApiHost, setSdkApiHost, sdkApiHostReady] = useGlobalState(
    "injectSdkApiHost",
    "",
    true,
  );
  const [sdkClientKey, setSdkClientKey, sdkClientKeyReady] = useGlobalState(
    "injectSdkClientKey",
    "",
    true,
  );
  const [autoInjectSdk, setAutoInjectSdk, autoInjectSdkReady] = useGlobalState(
    "autoInjectSdk",
    "0",
    true,
  );
  const ready =
    apiHostReady && sdkApiHostReady && sdkClientKeyReady && autoInjectSdkReady;

  const form = useForm({
    defaultValues: {
      sdkApiHost,
      sdkClientKey,
      autoInjectSdk,
    },
  });
  const submitForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const values = form.getValues();
    setSdkApiHost(values.sdkApiHost);
    setSdkClientKey(values.sdkClientKey);
    setAutoInjectSdk(values.autoInjectSdk);
    injectSdk({
      apiHost: values.sdkApiHost,
      clientKey: values.sdkClientKey,
      autoInject: values.autoInjectSdk === "1",
    });
    close();
  };

  useEffect(() => {
    if (!sdkApiHost) {
      setSdkApiHost(apiHost);
      form.setValue("sdkApiHost", apiHost);
    } else {
      form.setValue("sdkApiHost", sdkApiHost);
    }
    form.setValue("sdkClientKey", sdkClientKey);
    form.setValue("autoInjectSdk", autoInjectSdk);
  }, [ready]);

  return (
    <Form.Root className="FormRoot" onSubmit={submitForm}>
      <Form.Field className="FormField" name="sdkClientKey">
        <Form.Label className="FormLabel">Client Key</Form.Label>
        <Form.Control asChild>
          <div className="rt-TextFieldRoot rt-r-size-2 rt-variant-surface">
            <input
              className="rt-reset rt-TextFieldInput"
              {...form.register("sdkClientKey")}
            />
          </div>
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="sdkApiHost">
        <Form.Label className="FormLabel">GrowthBook API Host</Form.Label>
        <Form.Control asChild>
          <div className="rt-TextFieldRoot rt-r-size-2 rt-variant-surface">
            <input
              className="rt-reset rt-TextFieldInput"
              {...form.register("sdkApiHost")}
            />
          </div>
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormFieldInline my-4" name="autoInjectSdk">
        <Form.Control asChild>
          <Checkbox
            checked={form.watch("autoInjectSdk") === "1"}
            onCheckedChange={(v: boolean) =>
              form.setValue("autoInjectSdk", v ? "1" : "0")
            }
            size="3"
            mr="2"
          />
        </Form.Control>
        <Form.Label className="FormLabel cursor-pointer">
          Automatically inject an SDK onto this page in the future.
        </Form.Label>
      </Form.Field>

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

export default InjectSdkForm;
