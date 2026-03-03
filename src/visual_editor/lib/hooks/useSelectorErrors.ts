import { useState, useCallback } from "react";

export interface SelectorError {
  selector: string;
  error: string;
  timestamp: number;
  context?: string;
}

export function useSelectorErrors() {
  const [errors, setErrors] = useState<SelectorError[]>([]);
  const [lastError, setLastError] = useState<SelectorError | null>(null);

  const addError = useCallback((error: SelectorError) => {
    setErrors((prev) => [...prev, error]);
    setLastError(error);
    
    setTimeout(() => {
      setLastError(null);
    }, 5000);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setLastError(null);
  }, []);

  return {
    errors,
    lastError,
    addError,
    clearErrors,
  };
}

export function safeQuerySelector(
  selector: string,
  onError?: (error: SelectorError) => void,
  context?: string
): Element | null {
  try {
    return document.querySelector(selector);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Invalid CSS selector";
    console.error(`querySelector error in ${context || "unknown context"}:`, selector, e);
    
    if (onError) {
      onError({
        selector,
        error: errorMessage,
        timestamp: Date.now(),
        context,
      });
    }
    
    return null;
  }
}

export function safeQuerySelectorAll(
  selector: string,
  onError?: (error: SelectorError) => void,
  context?: string
): NodeListOf<Element> | [] {
  try {
    return document.querySelectorAll(selector);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Invalid CSS selector";
    console.error(`querySelectorAll error in ${context || "unknown context"}:`, selector, e);
    
    if (onError) {
      onError({
        selector,
        error: errorMessage,
        timestamp: Date.now(),
        context,
      });
    }
    
    return [] as any;
  }
}
