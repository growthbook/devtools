import React from "react"
import { number, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { GrowthBookDevToolsHeader } from "./GrowthBookDevToolsHeader";

export default {
  component: GrowthBookDevToolsHeader,
  title: "TODO Add Section/GrowthBookDevToolsHeader",
};

export const Default = () => {
  const onClick = action("clicked!");

  return (
    <>
      <GrowthBookDevToolsHeader />
    </>
  );
};
