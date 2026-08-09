/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Deployed Google Apps Script Web App URL used as the default sync endpoint.
   * Injected at build time; users can override it at runtime from the Sheets tab.
   */
  readonly VITE_SHEETS_WEB_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
