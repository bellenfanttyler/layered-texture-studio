# AGENTS.md

## Project

Build Layered 3D Texture Studio according to:

- `docs/product-brief.md`

The product brief is the source of truth for product behavior, architecture,
user experience, testing, deployment, privacy, and white-labeling.

## Objective

Deliver a polished, static, client-side web application that allows users to:

1. Import a 3D mesh.
2. Paint masks directly on its surface.
3. Apply textures and displacement through independent layers.
4. Preview the composite result.
5. Save and restore editable projects locally.
6. Export printable geometry.
7. Deploy the application to GitHub Pages.

## Required stack

Use:

- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- three-mesh-bvh
- Zustand
- Web Workers
- IndexedDB through Dexie
- Vitest
- Playwright

Do not replace these technologies without documenting a strong reason.

## Core engineering rules

- Keep the imported source mesh immutable.
- Store each texture layer's mask independently.
- Never compound edits onto the previous preview mesh.
- Keep large typed arrays outside React component state.
- Run expensive geometry processing in Web Workers.
- Use transferable ArrayBuffers where practical.
- Dispose of Three.js geometry, materials, textures, BVHs, and render targets.
- Do not transmit user models or textures to a server.
- Do not require authentication or a backend.
- Do not expose unfinished controls in the interface.
- Do not copy Formlabs branding, assets, text, or source code.

## White-label requirements

Do not hardcode branding in components.

Centralize:

- Product name
- Company name
- Tagline
- Logos
- Favicons
- Interface terminology
- Colors
- Fonts
- Support links
- Legal links
- Export filename prefixes
- Feature flags

Use:

- `src/config/brand.ts`
- `src/config/features.ts`
- `src/config/copy.ts`
- `src/styles/tokens.css`
- `public/brand/`

A substantially rebranded build must not require modifications to React
components or mesh-processing modules.

## Development behavior

Before making substantial changes:

1. Read the relevant sections of `docs/product-brief.md`.
2. Inspect the existing architecture.
3. State a brief implementation plan.
4. Identify risks or assumptions.
5. Implement the smallest complete vertical slice.
6. Run formatting, type checking, tests, and the production build.
7. Inspect browser console errors.
8. Summarize changes and remaining limitations.

## Commands

Use these standard commands:

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

Add any missing commands to `package.json`.

## Quality gates

A task is not complete until:

- TypeScript passes.
- Linting passes.
- Unit tests pass.
- The production build passes.
- There are no obvious browser console errors.
- The relevant workflow has been manually exercised.
- Documentation is updated when architecture or behavior changes.

## Git behavior

- Keep commits focused.
- Use descriptive commit messages.
- Do not commit generated build output unless deployment requires it.
- Do not rewrite published history.
- Do not force-push.
- Do not commit secrets, credentials, personal files, or proprietary models.

## Scope management

Prioritize:

1. Correct source-mesh preservation.
2. Surface painting.
3. Independent per-layer masks.
4. Layer compositing.
5. Responsive preview.
6. Correct STL export.
7. Project persistence.
8. Secondary tools and refinements.

When an advanced feature threatens the reliability of the core workflow,
implement a clean extension point and document the limitation instead of
shipping a deceptive or broken interface.
