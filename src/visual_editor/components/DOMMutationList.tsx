import React, { useCallback } from "react";
import { DeclarativeMutation } from "dom-mutator";
import { FC } from "react";
import { RxChevronDown } from "react-icons/rx";
import * as Accordion from "@radix-ui/react-accordion";
import DOMMutationEditor from "./DOMMutationEditor";

const DOMMutationAccordian: FC<{
  mutations: DeclarativeMutation[];
  onRemoveMutation: (mutation: DeclarativeMutation) => void;
}> = ({ mutations, onRemoveMutation }) => {
  return (
    <Accordion.Root
      className="text-xs rounded overflow-hidden"
      type="multiple"
    >
      {mutations.map((m, i) => (
        <Accordion.Item
          key={i}
          value={`item-${i}`}
          className="bg-slate-700 odd:bg-slate-600"
        >
          <Accordion.Header>
            <Accordion.Trigger className="p-2 text-sm text-light flex w-full justify-between">
              <div className="flex w-full">
                <div className="w-6">#{i + 1}.</div>
                <div className="w-12 text-left mx-2">
                  <code>{m.action}</code>
                </div>
                <code>{m.attribute}</code>
              </div>
              <RxChevronDown aria-hidden />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="flex flex-col rounded overflow-hidden">
            <div className="p-2 pb-0">
              {[
                "action",
                "attribute",
                "value",
                "selector",
                "parentSelector",
                "insertBeforeSelector",
              ]
                .filter((key) => !!m[key as keyof DeclarativeMutation])
                .map((key) => (
                  <div
                    key={key}
                    className="flex flex-col mb-2  last:mb-0"
                  >
                    <div className="text-xs text-slate-400 mb-1">
                      {key}
                    </div>
                    <div className="text-light">
                      <code>{m[key as keyof DeclarativeMutation]}</code>
                    </div>
                  </div>
                ))}
            </div>
            <div className="w-full flex justify-end p-2">
              <span
                className="text-red-500 hover:underline cursor-pointer"
                onClick={() => onRemoveMutation(m)}
              >
                delete
              </span>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};

const DOMMutationList: FC<{
  globalCss?: string;
  mutations: DeclarativeMutation[];
  addMutation?: (mutation: DeclarativeMutation) => void;
  removeDomMutation?: (mutation: DeclarativeMutation) => void;
  clearGlobalCss?: () => void;
  customJs?: string;
  clearCustomJs?: () => void;
}> = ({
  addMutation,
  mutations: _mutations,
  removeDomMutation,
  customJs,
  clearCustomJs,
  globalCss,
  clearGlobalCss,
}) => {
  const mutations: DeclarativeMutation[] = [
    ...(globalCss
      ? [
          {
            selector: "global",
            action: "set" as DeclarativeMutation["action"],
            value: globalCss,
            attribute: "css",
          },
        ]
      : []),
    ...(customJs
      ? [
          {
            selector: "global",
            action: "set" as DeclarativeMutation["action"],
            value: customJs,
            attribute: "js",
          },
        ]
      : []),
    ..._mutations,
  ];
  const [showEditor, setShowEditor] = React.useState(false);

  const onRemoveMutation = useCallback(
    (mutation: DeclarativeMutation) => {
      if (mutation.selector === "global" && mutation.attribute === "css") {
        clearGlobalCss?.();
        return;
      }
      if (mutation.selector === "global" && mutation.attribute === "js") {
        clearCustomJs?.();
        return;
      }
      removeDomMutation?.(mutation);
    },
    [removeDomMutation, clearGlobalCss]
  );

  return (
    <div className="px-4">
      <div className="mb-4">
        <DOMMutationAccordian
          mutations={mutations}
          onRemoveMutation={onRemoveMutation}
        />
      </div>

      {addMutation && !showEditor && (
        <div
          className="text-link text-sm"
          onClick={() => setShowEditor(true)}
        >
          + Add custom DOM mutation
        </div>
      )}

      {showEditor && addMutation && (
        <DOMMutationEditor
          addMutation={addMutation}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default DOMMutationList;
