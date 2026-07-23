# Architecture

## Current vertical slices

The first slice covers local or sample asset selection. The second imports binary or ASCII STL data in a dedicated worker, transfers position and normal buffers to an immutable source-mesh manager, and renders a separate copied `BufferGeometry` in React Three Fiber. Zustand stores only serializable UI and model metadata; browser `File` objects and typed arrays remain outside React state.

Configuration is split by concern:

- `brand.ts` and `brandDefaults.ts`: identity, links, export naming, metadata, and build overrides
- `copy.ts`: localization-ready visible language
- `features.ts`: optional capability visibility
- `sampleAssets.ts`: bundled model and texture catalog
- `tokens.css`: global visual system

The application shell is workspace-first. `App` imports the configured default
cube on startup, then keeps a three-column editing layout within the viewport:
model replacement, mesh details, brush controls, and export on the left, the
persistent 3D canvas in the center, and an independently scrollable
layer/texture rail on the right. Model replacement enters the existing
cancellable import pipeline only
after an explicit mask-transfer warning. Import failure or cancellation restores
the prior workspace; successful parsing atomically swaps the immutable source,
layers, and empty initial mask.

## Required processing boundaries

Future mesh work must preserve these invariants:

1. Imported source geometry is immutable.
2. Every layer owns an independent mask asset.
3. Typed arrays and binary assets are managed outside React state by stable IDs.
4. Preview and export geometry is reconstructed from the source, never from a previous preview.
5. Parsing, diagnostics, subdivision, displacement, and export run in cancellable Web Workers with transferable buffers where practical.
6. Three.js resources and BVH structures have explicit disposal ownership.
7. Session assets have explicit cleanup ownership; closing the workspace releases local files, object URLs, masks, source geometry, and disposable previews.

The viewport disposes its copied geometry on unmount, and closing the workspace removes the source asset. Import cancellation terminates the parser worker.

The third slice builds and serializes a mesh BVH in the parser worker. The immutable source asset retains the acceleration buffers, while each preview deserializes its own raycast structure. A dedicated mask manager owns per-vertex `Float32Array` weights. Painting uses BVH sphere queries, hit-normal similarity, and camera-facing tests; preview colors update during interaction, and pointer-up commits one delta-based history command.

The fourth slice extends Layer 1 with a configured grayscale source and normalized mapping/displacement settings. A cancellable worker decodes a bounded 1024px preview copy of the height map, samples three source-position planes, blends those projections by source-normal weights, and returns displaced positions plus preview heights. The viewport keeps an off-scene source/BVH copy for brush queries and a separate disposable visual geometry for worker results. Rendering occurs on demand, while the original image, source positions, normals, and per-layer mask remain unchanged.

The fifth slice generalizes the texture preview into an ordered layer collection. A layer controller owns add, duplicate, delete, selection, and reorder operations while the mask manager continues to own each layer's independent typed array. The preview request transfers copies of every layer mask to a worker, evaluates immutable source positions and normals, then composites visible layers bottom to top with Add, Subtract, or Replace behavior. The active layer alone supplies the editable mask overlay and paint target. Renaming, visibility, texture, and displacement settings remain serializable Zustand metadata rather than binary asset state.

Stroke undo is currently scoped to the selected layer. Switching layers or changing the layer structure clears stroke history so a command can never mutate a different mask; workspace-wide history remains a future slice.

The sixth slice adds local PNG, JPEG, and WebP height textures. A dedicated manager validates and decodes each image, retains the `File` and object URL outside React state, and exposes only a stable asset ID to layer metadata. Built-in and local sources resolve through one texture catalog, so worker preview and layer thumbnails share the same lookup boundary. Duplicated layers may share a local source; replacement and deletion revoke its object URL only after the final reference is gone. Closing or replacing the workspace clears all remaining local texture assets. Persistence is intentionally out of scope.

The seventh slice adds a cancellable binary STL export worker. Preview and export now share one worker-safe texture sampler and compositing implementation, preventing displacement behavior from drifting between the viewport and downloaded mesh. Export copies immutable source positions, normals, and independent masks, evaluates visible layers, validates finite coordinates and triangle area, recalculates face normals during little-endian STL serialization, and transfers only the finished buffer back for a branded browser download. Progress metadata remains in React state; geometry and output buffers do not.

Export currently preserves source topology and rejects degenerate output instead of silently repairing it. Subdivision, adaptive remeshing, broader safety analysis, repair proposals, and OBJ export remain future slices.

The eighth slice separates export preparation from download. Import derives angle-weighted normals shared by coincident STL vertices, so duplicated triangle records use one stable displacement direction and remain aligned. The export worker now counts boundary and non-manifold edges with scale-relative coordinate keys, measures displaced vertices and maximum displacement, and returns warnings with the validated STL buffer. The buffer stays in a component ref while React renders only the small preflight report; any mask or layer-setting revision remounts the panel, aborts active preparation, and discards stale output. Download requires a distinct user action after reviewing the report.

Preflight currently detects invalid coordinates, degenerate triangles, open boundaries, non-manifold edges, unusually large displacement, and files over 100 MB. Self-intersection, thickness, flipped-shell analysis, repair proposals, and subdivision remain future work. The next slice should define a bounded subdivision/detail strategy without weakening source-mesh immutability or worker cancellation.
