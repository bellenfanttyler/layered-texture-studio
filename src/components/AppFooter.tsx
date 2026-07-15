import { brand } from "../config/brand";
import { copy } from "../config/copy";

export function AppFooter() {
  const legalLinks = [
    ["Privacy", brand.links.privacy],
    ["Terms", brand.links.terms],
    ["Support", brand.links.support],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <footer className="app-footer">
      <div>
        <strong>{copy.welcome.privacy}</strong>
        <span>{copy.footer.browserNote}</span>
      </div>
      <nav aria-label="Footer">
        <a
          href={`${import.meta.env.BASE_URL}samples/LICENSES.md`}
          target="_blank"
          rel="noreferrer"
        >
          {copy.footer.licenseLabel}
        </a>
        {legalLinks.map(([label, href]) => (
          <a href={href} key={label} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
      </nav>
      <small>{brand.copyrightText}</small>
    </footer>
  );
}
