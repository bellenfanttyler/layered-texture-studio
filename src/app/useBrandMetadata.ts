import { useEffect } from "react";
import { brand } from "../config/brand";

export const useBrandMetadata = (): void => {
  useEffect(() => {
    document.title = brand.productName;
    document.documentElement.style.setProperty(
      "--brand-primary",
      brand.colors.primary,
    );
    document.documentElement.style.setProperty(
      "--brand-accent",
      brand.colors.accent,
    );
    document.documentElement.style.setProperty(
      "--brand-success",
      brand.colors.success,
    );
    document.documentElement.style.setProperty(
      "--brand-warning",
      brand.colors.warning,
    );
    document.documentElement.style.setProperty(
      "--brand-danger",
      brand.colors.danger,
    );
    document.documentElement.style.setProperty(
      "--font-interface",
      brand.fonts.interface,
    );
    document.documentElement.style.setProperty("--font-mono", brand.fonts.mono);

    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) favicon.href = brand.faviconUrl;
  }, []);
};
