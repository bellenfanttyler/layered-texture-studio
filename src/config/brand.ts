import { brandDefaults } from "./brandDefaults";

export interface BrandConfig {
  productName: string;
  shortName: string;
  tagline: string;
  companyName: string;
  description: string;
  logoUrl: string;
  compactLogoUrl: string;
  faviconUrl: string;
  socialPreviewUrl: string;
  colors: {
    primary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  themes: {
    light: { workspace: string; panel: string; text: string };
    dark: { workspace: string; panel: string; text: string };
  };
  fonts: { interface: string; mono: string };
  links: {
    support?: string;
    documentation?: string;
    privacy?: string;
    terms?: string;
  };
  copyrightText: string;
  poweredBy?: string;
  defaultProjectName: string;
  projectExtension: string;
  exportFilenamePrefix: string;
  analyticsEnabled: boolean;
}

const envString = (value: string | undefined, fallback: string): string =>
  value?.trim() || fallback;

const optionalEnvString = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const publicAsset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const brand: BrandConfig = {
  productName: envString(
    import.meta.env.VITE_PRODUCT_NAME,
    brandDefaults.productName,
  ),
  shortName: envString(
    import.meta.env.VITE_SHORT_NAME,
    brandDefaults.shortName,
  ),
  tagline: envString(import.meta.env.VITE_TAGLINE, brandDefaults.tagline),
  companyName: envString(
    import.meta.env.VITE_COMPANY_NAME,
    brandDefaults.companyName,
  ),
  description: brandDefaults.description,
  logoUrl: publicAsset("brand/logo.svg"),
  compactLogoUrl: publicAsset("brand/logo-compact.svg"),
  faviconUrl: publicAsset("brand/favicon.svg"),
  socialPreviewUrl: publicAsset("brand/social-preview.png"),
  colors: {
    primary: envString(
      import.meta.env.VITE_PRIMARY_COLOR,
      brandDefaults.primaryColor,
    ),
    accent: "#edbd75",
    success: "#79d4a2",
    warning: "#f0b96a",
    danger: "#ef8585",
  },
  themes: {
    light: { workspace: "#e8ece8", panel: "#f7f9f6", text: "#17211c" },
    dark: { workspace: "#0d1210", panel: "#151b18", text: "#edf4ef" },
  },
  fonts: {
    interface: 'Inter, "Segoe UI", system-ui, sans-serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  },
  links: {
    support: optionalEnvString(import.meta.env.VITE_SUPPORT_URL),
    documentation: optionalEnvString(import.meta.env.VITE_DOCUMENTATION_URL),
    privacy: optionalEnvString(import.meta.env.VITE_PRIVACY_URL),
    terms: optionalEnvString(import.meta.env.VITE_TERMS_URL),
  },
  copyrightText: `© ${new Date().getFullYear()} ${envString(import.meta.env.VITE_COMPANY_NAME, brandDefaults.companyName)}`,
  poweredBy: optionalEnvString(import.meta.env.VITE_POWERED_BY),
  defaultProjectName: "Untitled surface",
  projectExtension: ".l3ts",
  exportFilenamePrefix: "layered-texture",
  analyticsEnabled: false,
};
