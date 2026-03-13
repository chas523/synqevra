"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { WidgetType } from "@/types/widgetTypes";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";

interface WidgetEditorContextType {
  widgetType: WidgetType | null;
  loading: boolean;
  error: string | null;
  loadWidgetType: (id: string) => Promise<void>;
  updateWidgetType: (widgetType: WidgetType) => void;
  updateDescriptor: (descriptor: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
}

const WidgetEditorContext = createContext<WidgetEditorContextType | undefined>(
  undefined,
);

export function WidgetEditorProvider({ children }: { children: ReactNode }) {
  const [widgetType, setWidgetType] = useState<WidgetType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [past, setPast] = useState<WidgetType[]>([]);
  const [future, setFuture] = useState<WidgetType[]>([]);

  const loadWidgetType = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await WidgetService.getWidgetTypeById(id);
      setWidgetType(data);
      setPast([]);
      setFuture([]);
    } catch (err: any) {
      setError("Failed to load widget type");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWidgetType = useCallback((updated: WidgetType) => {
    setWidgetType((current) => {
      if (current) {
        setPast((prev) => [...prev, current]);
        setFuture([]);
      }
      return updated;
    });
  }, []);

  const updateDescriptor = useCallback((descriptor: any) => {
    setWidgetType((current) => {
      if (current) {
        const updated = { ...current, descriptor };
        setPast((prev) => [...prev, current]);
        setFuture([]);
        return updated;
      }
      return current;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setWidgetType((current) => {
        if (current) {
          setFuture((prevFuture) => [current, ...prevFuture]);
        }
        return previous;
      });

      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setWidgetType((current) => {
        if (current) {
          setPast((prevPast) => [...prevPast, current]);
        }
        return next;
      });

      return newFuture;
    });
  }, []);

  const isDirty = past.length > 0;

  return (
    <WidgetEditorContext.Provider
      value={{
        widgetType,
        loading,
        error,
        loadWidgetType,
        updateWidgetType,
        updateDescriptor,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        isDirty,
      }}
    >
      {children}
    </WidgetEditorContext.Provider>
  );
}

export function useWidgetEditor() {
  const context = useContext(WidgetEditorContext);
  if (context === undefined) {
    throw new Error(
      "useWidgetEditor must be used within a WidgetEditorProvider",
    );
  }
  return context;
}
