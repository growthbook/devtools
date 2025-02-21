import useResizeObserver from "@react-hook/resize-observer";
import React, { createContext, useContext, useRef, useState } from "react";
import { RESPONSIVE_W, TINY_W } from "..";

type Props = {
  children: React.ReactNode;
};
type Context = {
  isTiny: boolean;
  isResponsive: boolean;
};

const ResponsiveContext = createContext<Context | null>(null);

export const ResponsiveContextProvider = ({ children }: Props) => {
  const [isResponsive, setIsResponsive] = useState(false);
  const [isTiny, setIsTiny] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useResizeObserver(containerRef, (entry) => {
    setIsResponsive(entry.contentRect.width < RESPONSIVE_W);
    setIsTiny(entry.contentRect.width < TINY_W);
  });

  return (
    <ResponsiveContext.Provider value={{ isTiny, isResponsive }}>
      <div ref={containerRef}>{children}</div>
    </ResponsiveContext.Provider>
  );
};

export const useResponsiveContext = () => {
  const context = useContext(ResponsiveContext);

  if (!context)
    throw new Error(
      "ResponsiveContext must be called from within the ResponsiveContextProvider",
    );

  return context;
};
