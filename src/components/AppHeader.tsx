import { Moon, ShieldCheck, Sun } from "lucide-react";
import { brand } from "../config/brand";
import { copy } from "../config/copy";
import { features } from "../config/features";
import { useWelcomeStore } from "../app/store";
import { BrandMark } from "./BrandMark";

export function AppHeader() {
  const theme = useWelcomeStore((state) => state.theme);
  const setTheme = useWelcomeStore((state) => state.setTheme);

  return (
    <header className="app-header">
      <a
        className="brand-lockup"
        href="./"
        aria-label={`${brand.productName} home`}
      >
        <BrandMark />
        <span>
          <strong>{brand.productName}</strong>
          <small>{brand.companyName}</small>
        </span>
      </a>

      <div className="header-actions">
        <span className="privacy-status">
          <ShieldCheck size={15} aria-hidden="true" />
          {copy.navigation.privacyStatus}
        </span>
        {features.lightTheme && (
          <button
            className="icon-button"
            type="button"
            aria-label={copy.navigation.themeToggle}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
      </div>
    </header>
  );
}
