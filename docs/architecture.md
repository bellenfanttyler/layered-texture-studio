# Architecture

## Current vertical slices

The first slice covers local or sample asset selection. The second imports binary or ASCII STL data in a dedicated worker, transfers position and normal buffers to an immutable source-mesh manager, and renders a separate copied `BufferGeometry` in React Three Fiber. Zustand stores only serializable UI and model metadata; browser `File` objects and typed arrays remain outside React state.

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

The viewport disposes its copied geometry on unmount, and closing the workspace removes the source asset. Import cancellation terminates the parser worker.

The next complete slice should build adjacency and BVH data in a worker, create the first independent per-vertex mask asset, and support one dependable visible-surface paint stroke with undo.
