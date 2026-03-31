import { useState } from "react";

type CoapProtoSchemaSection =
  | "telemetry"
  | "attributes"
  | "rpcRequest"
  | "rpcResponse";

type UseCoapTransportFormParams<TForm> = {
  setFormState:
    | React.Dispatch<React.SetStateAction<TForm>>
    | React.Dispatch<React.SetStateAction<TForm | null>>;
};

const DEFAULT_EXPANDED = new Set<CoapProtoSchemaSection>(["telemetry"]);

export function useCoapTransportForm<TForm extends Record<string, unknown>>({
  setFormState,
}: UseCoapTransportFormParams<TForm>) {
  const [expandedCoapProtoSections, setExpandedCoapProtoSections] = useState<
    Set<CoapProtoSchemaSection>
  >(new Set(DEFAULT_EXPANDED));

  const setFormStateInternal = (
    updater: React.SetStateAction<TForm | null>,
  ) => {
    (setFormState as React.Dispatch<React.SetStateAction<TForm | null>>)(
      updater,
    );
  };

  const toggleCoapProtoSection = (section: CoapProtoSchemaSection) => {
    setExpandedCoapProtoSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const updateCoapField = (field: string, value: unknown) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev,
    );
  };

  const resetCoapUiState = () => {
    setExpandedCoapProtoSections(new Set(DEFAULT_EXPANDED));
  };

  return {
    expandedCoapProtoSections,
    toggleCoapProtoSection,
    updateCoapField,
    resetCoapUiState,
  };
}
