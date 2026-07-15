# White-labeling

A substantially rebranded build should require configuration and asset changes only—never edits to React components or future mesh-processing modules.

## Identity and links

Edit defaults in `src/config/brandDefaults.ts` and `src/config/brand.ts`. Common fields can instead be supplied at build time:

```env
VITE_PRODUCT_NAME=Acme Surface Studio
VITE_SHORT_NAME=Surface Studio
VITE_TAGLINE=Engineered texture, locally.
VITE_COMPANY_NAME=Acme Manufacturing
VITE_SUPPORT_URL=https://example.com/support
VITE_DOCUMENTATION_URL=https://example.com/docs
VITE_PRIVACY_URL=https://example.com/privacy
VITE_TERMS_URL=https://example.com/terms
VITE_PRIMARY_COLOR=#2457ff
```

Empty optional URLs disappear from the interface. Analytics remains disabled by default.

## Replaceable files

Replace files in `public/brand/` while retaining their names:

- `logo.svg`
- `logo-compact.svg`
- `favicon.svg`
- `social-preview.png`

The shell constrains assets with `object-fit`, so their dimensions can vary. The included files may be empty in a fresh repository; an accessible CSS monogram keeps the shell recognizable until brand art is supplied.

## Theme, terminology, and features

- Edit global visual values in `src/styles/tokens.css`.
- Edit welcome and interface language in `src/config/copy.ts`.
- Hide optional capabilities in `src/config/features.ts`.
- Change bundled sample metadata in `src/config/sampleAssets.ts` without moving or replacing the supplied source assets.

Set `VITE_BASE_PATH` for a GitHub Pages project path. The build-time HTML transform and runtime metadata hook both read the brand configuration so the title, description, favicon, colors, and visible identity remain aligned.
