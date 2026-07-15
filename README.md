# Layered 3D Texture Studio

A static, local-first browser application for building nondestructive texture and displacement layers on 3D models. This repository currently contains the production application foundation, white-label configuration, responsive welcome experience, and selectable bundled samples.

## Current scope

Implemented in this initialization milestone:

- Vite, React, and strict TypeScript application foundation
- Responsive dark/light welcome shell with accessible focus and reduced-motion behavior
- Local model file selection for STL, OBJ, GLB, and GLTF files
- Selectable bundled sample models and texture maps
- Central brand, copy, feature, theme-token, and sample-asset configuration
- Local-only file registry that keeps `File` objects outside component state
- WebGL 2 compatibility notice
- Vitest and Playwright test foundations
- GitHub Pages build and deployment workflow

Not yet implemented: mesh parsing or rendering, surface painting, texture layers, persistence, workers, diagnostics, project packaging, or geometry export. These capabilities must not be represented as working until their vertical slices are complete and tested.

## Requirements

- Node.js 22
- npm 10 or newer
- A recent desktop Chrome, Edge, Firefox, or Safari build with WebGL 2 for the future viewport

## Local development

```bash
npm install
npm run dev
```

Quality commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

The production output is written to `dist/`. No model or texture is transmitted to a service.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` checks, tests, builds, and deploys pushes to `main`. It derives the Vite base path from the repository name. In the repository settings, select **GitHub Actions** as the Pages source.

For a manual project-path build:

```bash
$env:VITE_BASE_PATH="/layered-texture-studio/"
npm run build
```

## Architecture

The repository follows the boundaries in [docs/architecture.md](docs/architecture.md). Source meshes will remain immutable; binary assets and large arrays will stay outside React state; expensive geometry work will run in workers; and derived previews will never become the next source mesh.

## Branding

See [WHITE_LABELING.md](WHITE_LABELING.md). Components read identity and terminology from typed configuration and CSS tokens rather than embedding product branding.

## Samples and licensing

The supplied samples are configured in `src/config/sampleAssets.ts`. Their license is preserved in [public/samples/LICENSES.md](public/samples/LICENSES.md). The bundled sample material is licensed CC BY-NC 4.0; review those terms before commercial redistribution.

Application dependency notices are summarized in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
