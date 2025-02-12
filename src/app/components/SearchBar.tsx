import { Container, ContainerProps, IconButton } from "@radix-ui/themes";
import React, { ChangeEvent } from "react";
import { PiXBold } from "react-icons/pi";

type SearchBarProps = ContainerProps & {
  searchInputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
  clear?: () => void;
  autoFocus?: boolean;
};

export default function SearchBar({
  searchInputProps,
  clear,
  autoFocus,
  ...containerProps
}: SearchBarProps) {
  return (
    <Container {...containerProps}>
      <div className="searchBar text-s">
        <input
          autoFocus={autoFocus}
          placeholder="Search..."
          type="text"
          {...searchInputProps}
        />
        {clear ? (
          <IconButton
            className="clear"
            size="1"
            variant="ghost"
            radius="full"
            color="gray"
            disabled={!searchInputProps?.value?.length}
            onClick={clear}
          >
            <PiXBold />
          </IconButton>
        ) : null}
      </div>
    </Container>
  );
}
