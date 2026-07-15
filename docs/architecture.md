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

The third slice builds and serializes a mesh BVH in the parser worker. The immutable source asset retains the acceleration buffers, while each preview deserializes its own raycast structure. A dedicated mask manager owns per-vertex `Float32Array` weights. Painting uses BVH sphere queries, hit-normal similarity, and camera-facing tests; preview colors update during interaction, and pointer-up commits one delta-based history command.

The fourth slice extends Layer 1 with a configured grayscale source and normalized mapping/displacement settings. A cancellable worker decodes a bounded 1024px preview copy of the height map, samples three source-position planes, blends those projections by source-normal weights, and returns displaced positions plus preview heights. The viewport keeps an off-scene source/BVH copy for brush queries and a separate disposable visual geometry for worker results. Rendering occurs on demand, while the original image, source positions, normals, and per-layer mask remain unchanged.

The next complete slice should generalize the single texture layer into an ordered layer collection with independent masks, add/delete/duplicate/rename/visibility operations, and bottom-to-top Add/Subtract/Replace compositing. GPU preview displacement is not export geometry; worker-based CPU sampling and displacement will be required for printable export.
