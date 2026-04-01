import { useEffect } from "react";

type UseLwm2mJsonSyncParams<TState> = {
  enabled: boolean;
  isJsonTouched: boolean;
  state: TState;
  currentJson: string;
  buildConfig: (state: TState) => unknown;
  onSyncJson: (json: string) => void;
  deps: ReadonlyArray<unknown>;
};

export function useLwm2mJsonSync<TState>({
  enabled,
  isJsonTouched,
  state,
  currentJson,
  buildConfig,
  onSyncJson,
  deps,
}: UseLwm2mJsonSyncParams<TState>) {
  useEffect(() => {
    if (!enabled || isJsonTouched) {
      return;
    }

    const nextJson = JSON.stringify(buildConfig(state), null, 2);
    if (nextJson !== currentJson) {
      onSyncJson(nextJson);
    }
  }, [
    enabled,
    isJsonTouched,
    state,
    currentJson,
    buildConfig,
    onSyncJson,
    ...deps,
  ]);
}
