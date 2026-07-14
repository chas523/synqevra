"use client";

import { useEffect } from "react";

const WHITELABEL_CSS_UPDATED_EVENT = "whitelabel-css-updated";
const WHITELABEL_CSS_VERSION_KEY = "whitelabel-css-version";
const THEME_STYLESHEET_ID = "whitelabel-light-colors";

const updateStylesheetVersion = (version: string) => {
  const href = `/public-assets/global/light-colors.css?v=${encodeURIComponent(version)}`;
  const link = document.getElementById(
    THEME_STYLESHEET_ID,
  ) as HTMLLinkElement | null;

  if (link) {
    link.href = href;
  }
};

export default function WhitelabelLightColorsLoader() {
  useEffect(() => {
    const storedVersion = window.localStorage.getItem(
      WHITELABEL_CSS_VERSION_KEY,
    );

    // Fetch latest version from MinIO
    fetch("/public-assets/global/css-version.json", { cache: "no-store" })
      .then((response) => response.json())
      .then(({ version }: { version?: string }) => {
        if (version) {
          window.localStorage.setItem(WHITELABEL_CSS_VERSION_KEY, version);
          updateStylesheetVersion(version);
        }
      })
      .catch(() => {
        // If fetch fails, keep current version (either from localStorage or v=0 from HTML)
      });

    const onCssUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const nextVersion = customEvent.detail;
      if (nextVersion) {
        window.localStorage.setItem(WHITELABEL_CSS_VERSION_KEY, nextVersion);
        updateStylesheetVersion(nextVersion);
      }
    };

    window.addEventListener(WHITELABEL_CSS_UPDATED_EVENT, onCssUpdated);

    return () => {
      window.removeEventListener(WHITELABEL_CSS_UPDATED_EVENT, onCssUpdated);
    };
  }, []);

  return null;
}
