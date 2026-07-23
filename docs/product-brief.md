# Layered 3D Texture Studio
## Full Product Requirements and Implementation Brief

**Purpose:** A one-shot implementation brief for building a standalone, white-label-ready browser application that lets users import a 3D mesh, paint selections directly on its surface, apply multiple displacement textures through independent layers, preview the composite result, and export printable geometry.

**Deployment target:** Static GitHub Pages site. No backend, login, account, API key, cloud processing, or required server-side service.

---

## 1. Product vision

Build a polished browser application called **Layered 3D Texture Studio**. It should retain the approachable upload-adjust-preview-export workflow of lightweight texture-displacement tools, while adding direct surface selection, nondestructive masks, multiple independently editable texture layers, stronger mesh diagnostics, safer displacement controls, and robust export.

The product should feel accessible to a product designer, engineer, maker, or 3D-printing user who does not know Blender. It must still provide enough precision and feedback to support real fabrication workflows.

### Primary user outcome

A first-time user can import a model, paint two different regions, apply two different textures on separate layers, preview their combined displacement, and export the final textured STL without creating an account or using desktop software.

### Core workflow

1. Import a 3D model.
2. Inspect mesh scale and diagnostics.
3. Create or activate a texture layer.
4. Choose a built-in, procedural, or uploaded grayscale texture.
5. Paint/select the surface region that should receive the texture.
6. Adjust mapping, scale, amplitude, midpoint, sharpness, and edge falloff.
7. Add more layers for different textures or overlapping effects.
8. Preview the final composite.
9. Validate and export a printable mesh.

---

## 2. Product principles

1. **Local and private:** Model files, textures, masks, and generated geometry remain on-device.
2. **Nondestructive:** The imported source mesh is immutable. Previews and exports are derived from it.
3. **Selection-first:** Painting and region-selection tools are first-class features.
4. **Layer-based:** Every texture has its own mask and settings.
5. **Predictable:** Overlaps, blend modes, units, and export behavior are explicit.
6. **Responsive:** Heavy work runs in Web Workers and never freezes the main interface.
7. **Fabrication-aware:** The app warns about mesh density, hard mask boundaries, excessive displacement, non-manifold geometry, and output size.
8. **White-label ready:** Product identity, colors, copy, assets, metadata, links, and feature flags are configuration-driven.
9. **No placeholders:** Do not expose unfinished controls or buttons.
10. **Polished core over broad fragility:** Reliable painting, layers, and export take priority over secondary features.

---

## 3. Non-negotiable constraints

### 3.1 Deployment

- Static frontend application.
- Deployable to a GitHub Pages project subdirectory.
- Relative asset paths and configurable Vite base path.
- Working production build and deployment workflow.
- No required backend, account, database, authentication, cloud upload, remote conversion, or API key.
- Application remains functional after initial load when offline, except for optional documentation links.

### 3.2 Browser support

Target recent desktop versions of Chrome, Edge, Firefox, and Safari. Desktop is primary; tablet is secondary. Show a friendly unsupported-browser message when WebGL 2 is unavailable.

### 3.3 Originality

Do not copy Formlabs branding, source code, proprietary assets, exact layout, or visual styling. The product may preserve the broadly useful import-preview-adjust-export concept but must have an original identity and implementation.

---

## 4. Recommended technical stack

- Vite
- TypeScript
- React
- Three.js
- @react-three/fiber
- @react-three/drei
- three-mesh-bvh for accelerated raycasting
- Zustand for application state
- Web Workers with Comlink or typed message protocols
- Lucide React for icons
- Vitest for unit and integration tests
- Playwright for critical end-to-end flows

Keep dependencies reasonable. Avoid a large UI framework when a compact custom design system is sufficient.

---

## 5. Information architecture and layout

Create a full-height, desktop-first application shell.

### 5.1 Top bar

Include:

- Configurable logo and product name
- New Workspace
- Open Model
- Export Mesh
- Undo / Redo
- Help
- Theme toggle
- Model name
- Mesh status indicator
- Primary Final Export button

### 5.2 Left toolbar and tool options

Tools:

- Orbit
- Paint Selection
- Erase Selection
- Surface Lasso
- Screen-Space Lasso
- Rectangle Select
- Connected Region
- Similar Normal
- Flood Fill
- Eyedropper / Inspect
- Measure
- Smooth Mask

Each tool has an icon, tooltip, shortcut, active state, and meaningful disabled state.

### 5.3 Center viewport

Support:

- Orbit, pan, and zoom
- Perspective and orthographic cameras
- Fit model and frame selection
- Standard orthographic views
- Reset camera
- Grid and ground-plane toggles
- Wireframe
- Original versus textured comparison
- Mask preview
- Active-layer preview
- Composite preview
- Displacement heatmap
- Fullscreen
- Orientation cube and axis indicator

### 5.4 Right panel

Tabs:

1. Layers
2. Texture
3. Selection
4. Mesh
5. Export

On narrower displays, convert this panel to a drawer.

### 5.5 Bottom status bar

Show triangle and vertex counts, selected coverage, active layer, brush radius, preview quality, processing state, memory estimate when available, and context-sensitive controls.

Example: `LMB paint - Alt erase - [ / ] brush size - Space orbit`

---

## 6. First-launch experience

Open directly into the editing workspace with the bundled cube loaded. The
starter cube is undisplaced and its initial texture layer has an empty mask.
Keep the viewport visible while editing: model replacement and brush controls
live in the left rail with mesh details and export, while layers and texture
controls live in an independently scrollable right rail.

Allow the user to replace the cube with a local model. Before opening the file
picker, explain that masks and texture layers are mesh-specific and cannot
transfer to the replacement. Cancelling leaves the current workspace intact;
a successful replacement starts with one empty mask.

Bundle at least two permissively licensed sample meshes and several original or permissively licensed displacement maps. Include a rounded enclosure, a cylindrical grip, and textures such as leather, knurl, hexagons, dots, fabric, waves, diamonds, lines, and noise.

---

## 7. Model import and unit handling

### Required formats

- Binary and ASCII STL
- OBJ

### Strongly preferred

- GLB / GLTF
- 3MF only if browser-side support is genuinely reliable

### Import flow

1. Parse file.
2. Center model without altering proportions.
3. Calculate bounds.
4. Detect or request units.
5. Generate missing normals.
6. Build BVH data.
7. Build adjacency information.
8. Run diagnostics.
9. Frame the camera.
10. Create an empty first texture layer.

Allow units of millimeters, centimeters, inches, and meters. Preserve export scale. Never silently rescale without showing the user.

### Diagnostics

Report:

- Vertex and triangle counts
- Physical dimensions
- Open boundary edges
- Non-manifold edges
- Degenerate triangles
- Disconnected components
- Inconsistent normals when detectable
- Uneven triangle sizes
- Mesh-density suitability
- Estimated memory and processing complexity

Warnings must use plain language and should not block editing unless parsing/rendering is impossible.

---

## 8. Surface selection and mask model

Surface selection is a core feature. Every texture layer owns an independent mask.

Store mask weights from 0 to 1:

- 0 = unaffected
- 1 = fully affected
- Intermediate values = feathered influence

Use a per-vertex mask for the first dependable implementation. Keep architecture open to per-face or texture-space masks later. Store large mask arrays outside React component state in typed-array asset managers keyed by IDs.

---

## 9. Paint selection tool

### Basic behavior

- Circular brush cursor projected onto the mesh
- Dragging paints the active layer mask
- Brush conforms to the visible surface
- Immediate translucent mask feedback
- Camera controls suspended during a stroke
- Space temporarily activates orbit
- One undo command per pointer-down stroke

### Brush controls

- Radius
- Hardness
- Strength
- Spacing
- Falloff curve
- Add, subtract, replace, and smooth modes
- Front-facing only
- Visible surfaces only
- Backface protection
- Geodesic and screen-space distance modes
- Physical-unit and pixel radius modes
- Pressure sensitivity where supported

### Default interaction

- Left drag: paint
- Alt + drag: erase
- Shift + drag: add
- Ctrl/Cmd + drag: smooth
- [ and ]: brush size
- Shift + mouse wheel: brush size
- Escape: cancel stroke
- Space: temporary orbit

Visible-surface protection must prevent selection through thin parts. Use raycasting, BVH queries, normal checks, and optional occlusion checks rather than applying a 2D circle through the entire object.

### Stroke quality

Interpolate between pointer samples to prevent gaps during fast movement. Use draft feedback during interaction, then debounce a full-quality preview after the stroke.

---

## 10. Additional selection tools

### Erase Selection

Dedicated erase tool sharing brush controls.

### Surface Lasso

Draw a closed path over the surface and resolve an enclosed surface region. When exact surface enclosure is not robust, implement a clearly labeled projected variant.

### Screen-Space Lasso

Select projected triangle centroids inside a polygon. Options: visible only, include occluded, add, subtract, replace. Default to visible only.

### Rectangle Selection

Select visible projected triangles inside a dragged rectangle with add/subtract/replace modes.

### Connected Region

Click to select a connected island or a connected region constrained by an angle threshold.

### Similar Normal

Select connected or global faces with normals similar to the clicked surface. Controls: angle tolerance, connected-only, maximum geodesic distance, visible-only.

### Flood Fill

Fill based on connectivity, angle threshold, curvature threshold, and mask boundaries.

### Mask commands

- Select All
- Clear
- Invert
- Grow
- Shrink
- Feather
- Harden
- Smooth
- Blur
- Threshold
- Copy mask
- Paste mask
- Transfer mask to another layer
- Create layer from selection

Every command must be undoable.

---

## 11. Mask visualization

Provide:

- Translucent color overlay
- Grayscale mask
- Selected-only isolation
- Hide selected / hide unselected
- Boundary outline
- Texture-on-selection preview
- X-ray mode
- Overlap visualization for regions affected by multiple layers

The active layer has a distinct highlight. Each layer may have a configurable display color used only for editing, not export.

---

## 12. Texture layer system

### Layer properties

Each layer contains:

- Unique ID and name
- Visibility, lock, and solo state
- Mask display color
- Mask asset ID and coverage
- Texture source
- Mapping mode and transform
- Scale/frequency
- Rotation and position
- Amplitude
- Midlevel / neutral height
- Emboss/deboss mode
- Sharpness/contrast
- Invert and gamma
- Blur
- Edge falloff
- Influence / opacity
- Blend mode
- Procedural seed where relevant
- Creation and modification metadata

### Layer operations

- Add
- Rename
- Duplicate
- Delete
- Reorder via drag and drop
- Show/hide
- Lock/unlock
- Solo
- Copy/paste settings
- Copy/paste mask
- Merge down
- Flatten visible layers
- Create from current selection
- Clear mask
- Replace texture
- Export mask data where feasible

Exactly one layer is active for painting and edits. Locked layers cannot be changed.

### Layer rows

Show texture thumbnail, mask coverage, layer name, visibility, lock, solo, blend indicator, and warning badge.

---

## 13. Layer compositing

Evaluate layers bottom to top. For each sampled vertex, combine mask weight, texture sample, influence, amplitude, midpoint, and blend mode.

Required blend modes:

- Add
- Subtract
- Replace
- Maximum
- Minimum
- Multiply in a controlled normalized form

Default is Add. Provide a “Clamp total displacement” option. The source mesh remains immutable; the preview and export geometry are derived outputs.

---

## 14. Texture sources

### Uploaded images

Support PNG, JPEG, and WebP. Convert color to luminance for displacement. Controls:

- Invert
- Levels
- Brightness
- Contrast
- Gamma
- Blur
- Seamless-tiling preview
- Rotation
- Horizontal and vertical flip

### Built-in library

Categories: Geometric, Grip, Organic, Fabric, Industrial, Decorative, Noise. Each preset has a thumbnail, name, defaults, tiling metadata, and license attribution.

### Procedural textures

Include deterministic seeded versions of:

- Checker
- Stripes
- Dots
- Hexagons
- Diamonds
- Waves
- Rings
- Perlin/simplex-style noise
- Voronoi/cellular
- Crossed-line knurl

---

## 15. Texture mapping

### Triplanar mapping - required and default

Support object-space and world-space projection, scale, rotation, offset, blend sharpness, and optional axis controls. Blend projections according to absolute normalized surface normals.

### Existing UVs - preferred

Offer Use Model UVs only when UVs exist. Warn about likely overlap when detectable.

### Planar mapping - preferred

Project from current camera, X/Y/Z axis, or custom orientation gizmo. Provide move, rotate, scale, numeric entry, and reset.

### Cylindrical mapping - future-ready / preferred

Controls: axis, rotation, scale, offset, and seam position.

---

## 16. Displacement controls

Per layer:

- Scale/frequency
- Amplitude in physical units when known
- Midlevel
- Emboss, deboss, centered, and custom midpoint
- Sharpness / texture contrast
- Invert
- Mask edge falloff
- Influence
- Mapping rotation and position
- Texture blur
- Optional normal smoothing

Show a zero-height indicator on the texture histogram. Suggest a safe range based on model dimensions but allow advanced numeric entry.

---

## 17. Live preview

### Modes

- Original
- Active Layer Only
- Composite
- Mask
- Displacement Heatmap
- Wireframe
- Before/After Split
- Before/After Toggle

### Quality levels

- Draft
- Balanced
- High
- Export

Temporarily drop to Draft while painting or dragging sliders, then restore the chosen quality after a short debounce.

### Implementation

Use the fastest reliable mix of GPU displacement, CPU geometry updates, cached subdivided preview meshes, and worker-generated meshes. Clearly label approximations. The visible result should remain close to final export.

### Lighting

Presets: Neutral Studio, Grazing Light, Softbox, High Contrast, Matcap-style inspection. Include light rotation, intensity, environment intensity, material roughness, and material color. These do not affect export.

---

## 18. Mesh density, subdivision, and edge handling

Provide export detail controls based on target edge length, maximum triangle count, or adaptive subdivision level.

Presets:

- Fast Preview
- Standard
- Fine
- Ultra
- Custom

Warn when mesh density is too low, requested detail may exceed memory, texture features are smaller than target edge length, or output will be extremely large.

Prefer adaptive subdivision near masked regions; at minimum, avoid subdividing entirely untextured areas unnecessarily.

For mask boundaries support feather width, edge smoothing, hard edge mode, preserve boundary, fade to zero, and cautious inward clamp near thin surfaces. Default to a gentle feather. Warn when high amplitude meets a hard edge.

---

## 19. Geometry safety and repair

Check for:

- Excessive displacement relative to model size or estimated local thickness
- Potential self-intersections
- Flipped and degenerate triangles
- Non-manifold output
- Boundary distortion
- NaN or invalid vertex values
- Unreasonably large output

Optional repair actions:

- Recalculate normals
- Remove degenerate faces
- Weld nearly identical vertices
- Fill small holes
- Remove isolated fragments
- Orient faces consistently

Never silently apply destructive repair. Show proposed changes and a pre-export report with passed checks, warnings, errors, triangle count, and estimated size. Permit export with noncritical warnings after acknowledgment.

---

## 20. Undo and redo

Use a command-based history system. Undoable actions include strokes, mask commands, layer changes, mapping transforms, texture changes, merges, and repair operations.

A slider drag creates one history entry on completion. Maintain at least 50 practical entries, subject to memory. Store mask deltas or changed-index ranges instead of full workspace copies. Warn when history is truncated due to memory pressure.

---

## 21. Session lifecycle

Project persistence, autosave, portable project files, and a local project browser are intentionally out of scope. Imported models, textures, masks, and editing state exist only for the active browser session. Clearly communicate that closing or reloading the page discards the workspace. Release object URLs, typed arrays, workers, and Three.js resources when assets are replaced or the workspace closes.

---

## 22. Export

### Required

- Binary STL
- OBJ preferred

### Optional when robust

- GLB
- 3MF

### Export modes

- Final displaced mesh
- Original mesh
- Active layer only
- Visible layers only
- Mask data

### Export dialog

Include filename, format, units, detail preset, triangle target, visible-layer summary, repairs, normal recalculation, weld tolerance, validation, and estimated output size.

### Export pipeline

1. Reconstruct from immutable source mesh.
2. Apply required subdivision.
3. Evaluate visible layers in order.
4. Sample masks and textures.
5. Accumulate displacement along stable source normals.
6. Recalculate or smooth normals.
7. Remove safely repairable invalid geometry.
8. Validate.
9. Serialize.
10. Trigger browser download.

Run in a Web Worker with stage progress and cancellation.

---

## 23. Performance requirements

Goals:

- Smooth orbiting for moderate models
- Immediate brush cursor response
- Paint feedback within one animation frame where practical
- Draft slider preview starts within about 100 ms
- Heavy work never blocks the interface
- Export remains cancellable
- Approximately 500,000-triangle models remain editable on capable devices

Use BVH acceleration, typed arrays, BufferGeometry, transferable ArrayBuffers, Web Workers, memoized sampling, debounced recomputation, progressive work, and explicit GPU resource disposal.

---

## 24. Responsive behavior

### Desktop

Full three-panel interface.

### Tablet

Collapsible panels, larger targets, two-finger orbit, one-finger painting in paint mode, and explicit mode switching.

### Phone

At minimum, allow workspace viewing, orbit, and layer visibility, while explaining that full editing is designed for desktop/tablet. Do not force the complete desktop interface into an unusable mobile layout.

---

## 25. Accessibility

Implement keyboard navigation, visible focus states, accessible icon names, persistent labels, sufficient contrast, reduced-motion support, non-color status indicators, screen-reader announcements for processing and errors, keyboard shortcut help, numeric inputs paired with sliders, and proper dialog focus trapping.

The painting interaction may require pointer input, but surrounding controls must remain accessible.

---

## 26. Help, onboarding, and errors

Provide a first-run tour covering import, layers, texture selection, painting, displacement, a second layer, and export.

Help must explain selection tools, mapping, displacement, mesh density, export, privacy, browser limitations, and shortcuts.

Errors must be actionable and user-friendly. Cover invalid files, huge models, missing restored textures, WebGL unavailability, and export memory failure. Use toasts for brief statuses and dialogs for decisions. Never expose raw stack traces in production.

---

## 27. White-label architecture

The app must be easy to rebrand without changing business logic or 3D processing code.

### 27.1 Brand configuration

Create a typed `src/config/brand.ts` with fields for:

- productName
- shortName
- tagline
- companyName
- logoUrl
- compactLogoUrl
- faviconUrl
- primary/accent/success/warning/danger colors
- light and dark theme tokens
- support, documentation, privacy, and terms links
- copyright text
- optional powered-by attribution
- default workspace name
- analytics flag, default false

No component may hardcode the product name, company name, brand colors, logo path, support address, legal copy, or download prefix.

### 27.2 Theme tokens

Use CSS custom properties for colors, backgrounds, borders, text, selection, masks, buttons, radii, shadows, fonts, weights, and spacing density. Rebranding should not require editing component CSS individually.

### 27.3 Replaceable assets

Use:

```text
public/brand/
  logo.svg
  logo-compact.svg
  favicon.svg
  social-preview.png
```

Assets of different dimensions must work through sensible size constraints and object-fit rules.

### 27.4 Centralized copy and terminology

Store interface terminology, welcome text, help copy, empty states, and privacy text in `src/config/copy.ts` or a localization-ready equivalent. Avoid scattering user-facing product language through components.

### 27.5 Feature flags

Create a typed configuration allowing optional visibility of light theme, procedural textures, import formats, advanced selection, repair, sample models, help links, and other secondary features. Disabled features disappear cleanly without empty panels or broken menus.

### 27.6 Build-time overrides

Support optional Vite environment variables for common branding fields, for example:

```env
VITE_PRODUCT_NAME=Acme Surface Studio
VITE_COMPANY_NAME=Acme Manufacturing
VITE_SUPPORT_URL=https://example.com/support
VITE_PRIMARY_COLOR=#2457ff
```

Environment variables override defaults but are not required for local development.

### 27.7 Metadata and deployment identity

Brand configuration controls browser title, meta description, favicon, Open Graph metadata, web manifest, theme color, and exported mesh filename.

Allow configuration of GitHub Pages base path, custom domain, links, attribution, samples, and default theme.

### 27.8 White-label documentation

Provide `WHITE_LABELING.md` explaining how to replace names, logos, favicon, colors, fonts, terminology, feature flags, legal/support links, metadata, and deployment settings.

### White-label acceptance criteria

1. One config change updates the product name everywhere.
2. Replacing `public/brand` assets updates logo, compact logo, favicon, and social preview.
3. Theme-token changes update the whole interface.
4. No old name remains in dialogs, metadata, downloads, help, or workspace defaults.
5. Attribution is optional.
6. Support/legal links can be replaced or hidden.
7. A second branded build requires no edits to React components or mesh modules.

---

## 28. Application state and architecture

Use normalized state and separate UI state, workspace state, binary assets, render caches, undo history, and worker state.

Suggested types:

```ts
interface WorkspaceState {
  name: string;
  model: ModelState | null;
  layers: TextureLayer[];
  activeLayerId: string | null;
  camera: CameraState;
  viewport: ViewportState;
  exportSettings: ExportSettings;
  history: HistoryMetadata;
}

interface TextureLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  solo: boolean;
  displayColor: string;
  maskAssetId: string;
  maskCoverage: number;
  texture: TextureSource;
  mapping: MappingSettings;
  displacement: DisplacementSettings;
  blendMode: "add" | "subtract" | "replace" | "max" | "min" | "multiply";
  influence: number;
}
```

Suggested source layout:

```text
src/
  app/
  components/
  viewport/
  selection/
  layers/
  textures/
  mesh/
  workers/
  history/
  config/
  hooks/
  styles/
  types/
  utils/
```

Keep geometry, masks, and generated assets in dedicated managers, not component state.

---

## 29. Processing design

### Immutable source

Never compound repeated displacement on the previous preview. Recompute from source or a cached source-derived subdivision.

### Brush algorithm

1. Raycast pointer into mesh.
2. Resolve hit point and face.
3. Query candidate vertices/faces using BVH and adjacency.
4. Compute chosen distance metric.
5. Reject backfacing or occluded candidates according to settings.
6. Apply hardness and falloff.
7. Blend mask values.
8. Record changed indices and previous values.
9. Update overlay.
10. Schedule composite preview.

### Triplanar sampling

Derive three planar UV pairs, sample each axis, weight by absolute normalized normal components, apply blend sharpness, combine, process invert/gamma/levels/blur, center around midpoint, and multiply by amplitude, mask, and influence.

### Displacement direction

Default to smoothed source vertex normals. Advanced alternatives may include face normals, radial direction, or a custom projection direction only when stable and clearly documented.

---

## 30. Keyboard shortcuts

- 1 Orbit
- 2 Paint
- 3 Erase
- 4 Lasso
- 5 Rectangle
- F Frame
- B Before/after
- M Mask preview
- W Wireframe
- [ / ] Brush size
- Shift + [ / ] Brush hardness
- Ctrl/Cmd + Z Undo
- Ctrl/Cmd + Shift + Z Redo
- Ctrl/Cmd + O Open model
- Ctrl/Cmd + E Export
- Delete Contextual delete/clear
- Escape Cancel
- Space Temporary orbit
- H Hide/show panels
- ? Help

Do not intercept shortcuts while typing in fields.

---

## 31. Visual design requirements

Use an original industrial-design aesthetic with a neutral dark workspace, optional light theme, one configurable accent, clear hierarchy, compact professional controls, and restrained radii/shadows.

Viewport details:

- Neutral gradient
- Optional ground and contact shadow
- Orientation cube and axis marker
- Selected-object outline
- Brush ring plus hardness ring
- Busy overlay during processing

Displacement inputs should combine slider, numeric field, unit, reset, and fine adjustment. Layer rows should be compact but clear. Every panel needs a meaningful empty state.

---

## 32. Required delivery scope

### Required in delivered build

- STL and OBJ import
- Interactive viewport
- Per-vertex mask painting
- Add/subtract brush behavior
- Radius, hardness, strength
- Visible-surface protection
- Layer add/delete/duplicate/reorder/rename/show/lock
- Independent texture and displacement settings
- Add, Subtract, Replace blend modes
- Triplanar mapping
- Built-in texture library
- Custom image upload
- Live composite preview
- Undo/redo
- Binary STL export
- Mesh diagnostics
- Worker-based progress and cancellation
- Sample model
- GitHub Pages workflow
- Critical automated tests
- White-label configuration and documentation

### Strongly preferred

- GLB import
- UV and planar mapping
- Lasso and connected selection
- Mask grow/shrink/feather/smooth
- OBJ export
- Before/after split
- Procedural textures
- Overlap visualization
- Export validation

### Future-ready extension points

- 3MF
- Cylindrical mapping
- GPU compute
- Adaptive remeshing
- Curvature-aware selection
- Thickness analysis
- AI-generated maps
- Vector logo and text embossing
- Symmetry/mirror painting
- Multi-object scenes

Do not show unfinished features.

---

## 33. Acceptance scenarios

### A. Localized texture

Load sample enclosure, choose hex texture, paint top region, adjust amplitude, confirm only the selected region changes, orbit and confirm no opposite-side painting, export binary STL, and reopen it successfully.

### B. Multiple textures

Apply leather on Layer A and diamond grip on Layer B in separate areas. Confirm simultaneous display, visibility toggles, reordering, overlap blend behavior, and visible-layer export.

### C. Mask editing

Paint, erase, undo, redo, smooth edge, and confirm a gradual displacement transition.

### D. Custom texture

Create two layers, paint both, upload a custom PNG, JPEG, or WebP texture, and confirm it remains local, previews correctly, and can be replaced without affecting the other layer.

### E. Long operation

Start a high-detail export, verify responsive UI and progress, cancel it, and return to editing without reload.

### F. Mesh warning

Load a low-density or non-manifold model, show understandable diagnostics, permit viewing, and warn before export.

### G. White-label build

Change the brand config and assets, build again, and verify that names, colors, logos, metadata, links, default filenames, help copy, and attribution update without component edits.

---

## 34. Testing

### Unit tests

- Brush falloff
- Mask add/subtract/replace/smooth
- Layer compositing
- Texture normalization
- Triplanar weights
- Displacement calculations
- Unit conversion
- Undo delta application
- Export validation
- Brand config resolution and environment overrides

### Integration tests

- Import creates workspace state
- Painting changes only active layer
- Locked layers remain unchanged
- Reorder changes composite output
- Texture replacement preserves unrelated layer masks
- Worker cancellation cleans up
- Deleted GPU/resources are disposed
- Feature flags remove UI cleanly

### End-to-end tests

Use Playwright to open a sample, add a layer, import a custom texture, simulate painting where practical, initiate STL export, verify download, and load a second white-label configuration.

---

## 35. Documentation and repository deliverables

Deliver a complete repository with:

- Working source
- Production build
- GitHub Pages workflow
- Sample assets and licenses
- Automated tests
- README
- User guide
- Technical architecture notes
- WHITE_LABELING.md
- Third-party license notices

README must cover overview, features, screenshots, local development, build, Pages deployment, browser support, formats, privacy, architecture, known limitations, and licensing.

The project must run with:

```bash
npm install
npm run dev
```

The production build must succeed with:

```bash
npm run build
```

At completion, report implemented features, supported formats, known limitations, test results, commands, and deployment steps.

---

## 36. GitHub Pages configuration

Support a project path such as:

`https://username.github.io/layered-texture-studio/`

Configure Vite base paths correctly. Include a GitHub Actions flow that checks out, installs, tests, builds, uploads the Pages artifact, and deploys. Prefer a one-screen app without complex routing; provide a compatible fallback if routing is introduced.

---

## 37. Quality bar and implementation priority

The result must not be a crude prototype. It must have a coherent visual system, reliable painting, clear active-layer behavior, responsive processing, useful errors, working export, no model-data transmission, no placeholder controls, and no obvious console errors.

When tradeoffs are necessary, prioritize:

1. Source-mesh and workspace data integrity
2. Correct per-layer masks
3. Reliable surface painting
4. Correct layer compositing
5. Responsive viewport
6. Accurate export
7. Diagnostics and safety warnings
8. Secondary selection tools
9. Advanced mapping
10. Cosmetic enhancements

Do not sacrifice mask integrity or export correctness merely to make previews faster.

---

## 38. Definition of done

The product is done when a new user can:

- Open the hosted GitHub Pages app
- Import a model
- Confirm or change units
- Create multiple texture layers
- Paint distinct regions directly on the model
- Avoid accidental through-painting
- Apply different image or procedural textures
- Adjust per-layer displacement and mapping
- Understand overlap behavior
- Undo and redo edits
- Validate and export a printable STL
- Rebrand the app using configuration and replaceable assets only

No login, backend, cloud processing, or external desktop software may be required.
