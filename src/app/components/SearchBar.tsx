import { Container, ContainerProps, IconButton } from "@radix-ui/themes";
import React, { ChangeEvent } from "react";
import { PiXBold, PiXCircle } from "react-icons/pi";

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
      <input
        autoFocus={autoFocus}
        className="searchBar text-s "
        placeholder="Search..."
        type="text"
        {...searchInputProps}
      />
      {clear ? (
        <IconButton
          size="1"
          variant="ghost"
          radius="full"
          color="gray"
          disabled={!searchInputProps?.value?.length}
          onClick={clear}
          style={{
            marginLeft: 2,
            marginTop: 2,
          }}
        >
          <PiXBold />
        </IconButton>
      ) : null}
    </Container>
  );
}
