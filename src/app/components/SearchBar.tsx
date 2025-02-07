import { Container, ContainerProps } from "@radix-ui/themes";
import React, { ChangeEvent } from "react";

type SearchBarProps = ContainerProps & {
  searchInputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
  autoFocus?: boolean;
};

export default function SearchBar({
  searchInputProps,
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
    </Container>
  );
}
