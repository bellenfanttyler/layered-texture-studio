/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRODUCT_NAME?: string;
  readonly VITE_SHORT_NAME?: string;
  readonly VITE_TAGLINE?: string;
  readonly VITE_COMPANY_NAME?: string;
  readonly VITE_SUPPORT_URL?: string;
  readonly VITE_DOCUMENTATION_URL?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_POWERED_BY?: string;
  readonly VITE_PRIMARY_COLOR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
