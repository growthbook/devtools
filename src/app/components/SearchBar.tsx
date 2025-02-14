import { Container, ContainerProps, IconButton } from "@radix-ui/themes";
import React, { ChangeEvent } from "react";
import {PiMagnifyingGlassBold, PiXBold} from "react-icons/pi";

type SearchBarProps = ContainerProps & {
  searchInputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
  clear?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
};

export default function SearchBar({
  searchInputProps,
  clear,
  autoFocus,
  placeholder = "Search...",
  ...containerProps
}: SearchBarProps) {
  return (
    <Container {...containerProps}>
      <div className="searchBar">
        <PiMagnifyingGlassBold className="inline-block mx-1 text-slate-8" size={16} />
        <input
          autoFocus={autoFocus}
          placeholder={placeholder}
          type="text"
          {...searchInputProps}
        />
        {clear && searchInputProps?.value?.length ? (
          <IconButton
            className="clear"
            size="1"
            variant="ghost"
            radius="full"
            color="gray"
            onClick={clear}
          >
            <PiXBold />
          </IconButton>
        ) : null}
      </div>
    </Container>
  );
}
