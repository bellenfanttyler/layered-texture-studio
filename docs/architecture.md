# Architecture

## Current vertical slice

The first slice ends at local or sample asset selection. Zustand stores only serializable UI metadata. Selected browser `File` objects live in a module registry outside React state, establishing the boundary that future model and texture managers will follow.

Configuration is split by concern:

- `brand.ts` and `brandDefaults.ts`: identity, links, export naming, metadata, and build overrides
- `copy.ts`: localization-ready visible language
- `features.ts`: optional capability visibility
- `sampleAssets.ts`: bundled model and texture catalog
- `tokens.css`: global visual system

## Required processing boundaries

Future mesh work must preserve these invariants:

1. Imported source geometry is immutable.
2. Every layer owns an independent mask asset.
3. Typed arrays and binary assets are managed outside React state by stable IDs.
4. Preview and export geometry is reconstructed from the source, never from a previous preview.
5. Parsing, diagnostics, subdivision, displacement, and export run in cancellable Web Workers with transferable buffers where practical.
6. Three.js resources and BVH structures have explicit disposal ownership.
7. Dexie persists source assets, masks, and project metadata locally; disposable previews are regenerated.

The next complete slice should parse one supported model format in a worker, store its immutable buffers, render it in React Three Fiber, frame the camera, report basic diagnostics, and cleanly dispose it on replacement.
