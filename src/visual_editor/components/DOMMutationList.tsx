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
      className="gb-text-xs gb-rounded gb-overflow-hidden"
      type="multiple"
    >
      {mutations.map((m, i) => (
        <Accordion.Item
          key={i}
          value={`item-${i}`}
          className="gb-bg-slate-700 odd:gb-bg-slate-600"
        >
          <Accordion.Header>
            <Accordion.Trigger className="gb-p-2 gb-text-sm gb-text-light gb-flex gb-w-full gb-justify-between">
              <div className="gb-flex gb-w-full">
                <div className="gb-w-6">#{i + 1}.</div>
                <div className="gb-w-12 gb-text-left gb-mx-2">
                  <code>{m.action}</code>
                </div>
                <code>{m.attribute}</code>
              </div>
              <RxChevronDown aria-hidden />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="gb-flex gb-flex-col gb-rounded gb-overflow-hidden">
            <div className="gb-p-2 gb-pb-0">
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
                    className="gb-flex gb-flex-col gb-mb-2  last:gb-mb-0"
                  >
                    <div className="gb-text-xs gb-text-slate-400 gb-mb-1">
                      {key}
                    </div>
                    <div className="gb-text-light">
                      <code>{m[key as keyof DeclarativeMutation]}</code>
                    </div>
                  </div>
                ))}
            </div>
            <div className="gb-w-full gb-flex gb-justify-end gb-p-2">
              <span
                className="gb-text-red-500 hover:gb-underline gb-cursor-pointer"
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
    [removeDomMutation, clearGlobalCss],
  );

  return (
    <div className="gb-px-4">
      <div className="gb-mb-4">
        <DOMMutationAccordian
          mutations={mutations}
          onRemoveMutation={onRemoveMutation}
        />
      </div>

      {addMutation && !showEditor && (
        <div
          className="gb-text-link gb-text-sm"
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
