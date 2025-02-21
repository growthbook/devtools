import React, { ReactNode, useMemo } from "react";
import ReactSelect, {
  FormatOptionLabelMeta,
  MenuPlacement,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import { customStyles, SingleValue } from "./SelectField";
import { clone } from "lodash";
import { isDefined } from "@/app/utils";

export type MultiSelectFieldProps = {
  value: string[];
  placeholder?: string;
  className?: string;

  options: SingleValue[];
  initialOption?: string;
  onChange: (value: string[]) => void;
  sort?: boolean;
  closeMenuOnSelect?: boolean;
  creatable?: boolean;
  formatOptionLabel?: (
    value: SingleValue,
    meta: FormatOptionLabelMeta<SingleValue>,
  ) => ReactNode;
  isOptionDisabled?: (_: SingleValue) => boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  menuPlacement?: MenuPlacement;
  formatCreateLabel?: (value: string) => ReactNode;
  validOptionPattern?: string;
};

export default function MultiSelectField({
  value,
  options,
  className,
  onChange,
  initialOption,
  placeholder = "Select...",
  sort = true,
  disabled,
  autoFocus,
  creatable,
  closeMenuOnSelect = false,
  formatOptionLabel,
  isOptionDisabled,
  menuPlacement,
  formatCreateLabel,
  validOptionPattern,
}: MultiSelectFieldProps) {
  const map = useMemo(() => {
    const map = new Map<string, SingleValue>();
    options.forEach((opt) => {
      map.set(opt.value, opt);
    });
    return map;
  }, [options]);

  const selected = value.map((v) => map.get(v)).filter(isDefined);

  let sorted = clone(options);
  if (sort) {
    sorted.sort();
  }

  const Component = creatable ? CreatableSelect : ReactSelect;

  return (
    <Component
      isMulti
      className={className}
      menuPlacement={menuPlacement}
      classNamePrefix="gb-multi-select"
      formatOptionLabel={formatOptionLabel}
      isDisabled={disabled || false}
      options={sorted}
      onChange={(selected) => {
        onChange(selected?.map((s) => s.value) ?? []);
      }}
      closeMenuOnSelect={closeMenuOnSelect}
      autoFocus={autoFocus}
      value={selected}
      {...(creatable
        ? {
            formatCreateLabel,
            isValidNewOption: (value) => {
              if (!validOptionPattern) return true;
              return new RegExp(validOptionPattern).test(value);
            },
          }
        : {})}
      placeholder={initialOption ?? placeholder}
      isOptionDisabled={isOptionDisabled}
      styles={customStyles}
      noOptionsMessage={() => null}
    />
  );
}
