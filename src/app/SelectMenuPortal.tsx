import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const SelectMenuPortalContext = createContext<HTMLElement | null>(null);

export function SelectMenuPortalProvider({ children }: { children: React.ReactNode }) {
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLDivElement | null) => {
    setPortalEl(el);
  }, []);

  return (
    <SelectMenuPortalContext.Provider value={portalEl}>
      {children}
      <div ref={setRef} data-select-menu-portal />
    </SelectMenuPortalContext.Provider>
  );
}

export function useSelectMenuPortal(): HTMLElement | null {
  return useContext(SelectMenuPortalContext);
}
