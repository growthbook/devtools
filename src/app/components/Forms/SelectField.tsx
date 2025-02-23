import React, { ReactNode, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import ReactSelect, {
  FormatOptionLabelMeta,
  MenuPlacement,
} from "react-select";
import { clone } from "lodash";

export const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? "var(--focus-8)" : "var(--gray-a7)",
    borderWidth: "var(--text-field-border-width)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--focus-8)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "var(--focus-8)" : "var(--gray-a7)",
    },
    color: "var(--gray-12)",
    backgroundColor: "var(--color-surface)",
  }),
  menu: (provided: any) => ({
    ...provided,
    background: "var(--color-surface)"
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "var(--focus-9)"
      : state.isFocused
        ? "var(--focus-a3)"
        : "transparent",
    color: state.isSelected ? "white" : "inherit",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "var(--focus-a6)",
    },
    height: "30px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "var(--text-gray-12)",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "var(--text-gray-12)",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    color: "var(--text-gray-12)",
    backgroundColor: "var(--violet-a4)",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "var(--gray-12)",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    "&:hover": {
      backgroundColor: "var(--red-a4)",
      color: "var(--red-10)",
    }
  })
};

export type SingleValue = { label: string; value: string; tooltip?: string };
export type FormatOptionLabelType = (
  value: SingleValue,
  meta: FormatOptionLabelMeta<SingleValue>,
) => ReactNode;

export type SelectFieldProps = {
  value: string;
  disabled?: boolean;
  className?: string;
  markRequired?: boolean;
  placeholder?: string;
  options: SingleValue[];
  initialOption?: string;
  onChange: (value: string) => void;
  sort?: boolean;
  creatable?: boolean;
  formatCreateLabel?: (value: string) => ReactNode;
  formatOptionLabel?: FormatOptionLabelType;
  isSearchable?: boolean;
  isClearable?: boolean;
  isOptionDisabled?: (_: SingleValue) => boolean;
  forceUndefinedValueToNull?: boolean;
  validOptionPattern?: string;
  autoFocus?: boolean;
  menuPlacement?: MenuPlacement;
};

export default function SelectField({
  value,
  options,
  className,
  disabled,
  onChange,
  initialOption,
  placeholder = "Select...",
  sort = true,
  creatable = false,
  formatCreateLabel,
  formatOptionLabel,
  isSearchable = true,
  isClearable = false,
  isOptionDisabled,
  // forces re-render when input is undefined
  forceUndefinedValueToNull = false,
  autoFocus,
  validOptionPattern,
  menuPlacement,
}: SelectFieldProps) {
  const map = useMemo(() => {
    const map = new Map<string, SingleValue>();
    options.forEach((opt) => {
      map.set(opt.value, opt);
    });
    return map;
  }, [options]);
  const selected = {
    label: value,
    value: value,
  };
  let sorted = clone(options);
  if (sort) {
    sorted.sort();
  }

  const [inputValue, setInputValue] = useState("");

  if (creatable) {
    return (
      <CreatableSelect
        menuPlacement={menuPlacement}
        className={className}
        isClearable={isClearable}
        isDisabled={disabled || false}
        placeholder={placeholder}
        inputValue={inputValue}
        options={sorted}
        formatCreateLabel={formatCreateLabel}
        isValidNewOption={(value) => {
          if (!validOptionPattern) return true;
          return new RegExp(validOptionPattern).test(value);
        }}
        autoFocus={autoFocus}
        onChange={(selected) => {
          onChange(selected?.value || "");
          setInputValue("");
        }}
        onFocus={() => {
          if (!selected?.value || !map.has(selected?.value)) {
            // If this was a custom option, reset the input value so it's editable
            setInputValue(selected?.value || "");
          }
        }}
        onInputChange={(val) => {
          setInputValue(val);
        }}
        onKeyDown={(event) => {
          if (!inputValue) return;
          switch (event.key) {
            case "Enter":
            case "Tab":
              onChange(inputValue);
              setInputValue("");
          }
        }}
        onCreateOption={(val) => {
          onChange(val);
        }}
        noOptionsMessage={() => null}
        value={selected}
        formatOptionLabel={formatOptionLabel}
        isSearchable={!!isSearchable}
        isOptionDisabled={isOptionDisabled}
        styles={customStyles}
        classNamePrefix="gb-multi-select"
      />
    );
  }

  return (
    <ReactSelect
      menuPlacement={menuPlacement}
      isClearable={isClearable}
      className={className}
      isDisabled={disabled || false}
      options={sorted}
      onChange={(selected) => {
        onChange(selected?.value || "");
      }}
      autoFocus={autoFocus}
      value={forceUndefinedValueToNull ? (selected ?? null) : selected}
      placeholder={initialOption ?? placeholder}
      formatOptionLabel={formatOptionLabel}
      isSearchable={!!isSearchable}
      isOptionDisabled={isOptionDisabled}
      styles={customStyles}
      classNamePrefix="gb-multi-select"
    />
  );
}
