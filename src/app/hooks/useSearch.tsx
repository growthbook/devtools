import { FaSortDown, FaSortUp, FaSort } from "react-icons/fa6";
import React, {
  ChangeEvent,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Flex } from "@radix-ui/themes";

export interface SearchProps<T> {
  items: T[];
  defaultSortField: keyof T;
  defaultSortDir?: number;
  undefinedLast?: boolean;
  useSort?: boolean;
}

export interface SearchReturn<T> {
  items: T[];
  clear: () => void;
  searchInputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
  SortableHeader: FC<{
    field: keyof T;
    className?: string;
    children: ReactNode;
    style?: React.CSSProperties;
  }>;
}

export function useSearch<T>({
  items,
  defaultSortField,
  defaultSortDir,
  undefinedLast,
  useSort = true,
}: SearchProps<T>): SearchReturn<T> {
  const [value, setValue] = useState("");
  const [sort, setSort] = useState({
    field: defaultSortField,
    dir: defaultSortDir || 1,
  });

  const filtered = useMemo(() => {
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
    );
  }, [items, value]);

  const sorted = useMemo(() => {
    const sorted = [...filtered];

    sorted.sort((a, b) => {
      const comp1 = a[sort.field];
      const comp2 = b[sort.field];
      if (undefinedLast) {
        if (comp1 === undefined && comp2 !== undefined) return 1;
        if (comp2 === undefined && comp1 !== undefined) return -1;
      }
      if (typeof comp1 === "string" && typeof comp2 === "string") {
        return comp1.localeCompare(comp2) * sort.dir;
      }
      if (typeof comp1 === "number" && typeof comp2 === "number") {
        return (comp1 - comp2) * sort.dir;
      }
      return 0;
    });
    return sorted;
  }, [sort.field, sort.dir, filtered]);

  const SortableHeader = useMemo(() => {
    const component: FC<{
      field: keyof T;
      className?: string;
      children: ReactNode;
      style?: React.CSSProperties;
    }> = ({ children, field, className = "", style }) => {
      return (
        <div className={className} style={style}>
          <span
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setSort({
                field,
                dir: sort.field === field ? sort.dir * -1 : 1,
              });
            }}
          >
            <Flex align="center">
              {children}{" "}
              <a
                href="#"
                className={sort.field === field ? "activesort" : "inactivesort"}
              >
                {sort.field === field ? (
                  sort.dir < 0 ? (
                    <FaSortDown />
                  ) : (
                    <FaSortUp />
                  )
                ) : (
                  <FaSort />
                )}
              </a>
            </Flex>
          </span>
        </div>
      );
    };
    return component;
  }, [sort.dir, sort.field]);

  const clear = useCallback(() => {
    setValue("");
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  }, []);

  return {
    items: useSort ? sorted : filtered,
    clear,
    searchInputProps: {
      value,
      onChange,
    },
    SortableHeader,
  };
}
