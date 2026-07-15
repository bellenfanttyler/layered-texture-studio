export const copy = {
  navigation: {
    privacyStatus: "Local-only workspace",
    themeToggle: "Toggle color theme",
  },
  welcome: {
    eyebrow: "Private by design",
    title: "Build texture stories, one surface at a time.",
    introduction:
      "Begin with your own mesh or pair a supplied model with one or more displacement maps. Your choices stay on this device.",
    dropTitle: "Drop a 3D model here",
    dropHint: "or choose a binary or ASCII STL file",
    chooseFile: "Choose model file",
    selectedFile: "Local model selected",
    sampleHeading: "Start with a sample",
    sampleSubheading:
      "Choose one model and any textures you want waiting in your project.",
    modelGroup: "Sample models",
    textureGroup: "Sample textures",
    selectionEmpty: "Select a model to begin your sample setup.",
    selectionReady: "Sample setup ready",
    openSample: "Open sample model",
    openLocal: "Open selected model",
    privacy: "Your files stay on this device. Nothing is uploaded.",
    initializationNote:
      "STL viewing is available now. Surface painting, texture application, project saving, and geometry export remain hidden until those workflows are complete.",
    compatibilityTitle: "WebGL 2 is unavailable.",
    compatibilityDetail:
      "Model preview requires a recent browser with hardware acceleration enabled.",
    sectionKicker: "Curated starting points",
    importErrorTitle: "That model could not be opened",
  },
  loading: {
    title: "Preparing your model",
    detail: "Geometry processing stays on this device.",
    cancel: "Cancel import",
    openingViewport: "Opening the private 3D viewport…",
  },
  workspace: {
    back: "Choose another model",
    sourceProtected: "Immutable source",
    sourceDetail: "Preview geometry is rebuilt from a protected source copy.",
    overview: "Mesh overview",
    dimensions: "Dimensions",
    triangles: "Triangles",
    vertices: "Vertices",
    format: "Format",
    units: "Assumed units",
    fileSize: "File size",
    viewportHint: "Drag to orbit · Scroll to zoom · Right-drag to pan",
    selectedMaps: "Selected maps",
    selectedMapsDetail:
      "These references are preserved for the upcoming layer workflow; they are not yet applied to the mesh.",
    noMaps: "No texture maps selected.",
  },
  steps: [
    {
      number: "01",
      title: "Import",
      detail: "Choose a local mesh or supplied sample.",
    },
    {
      number: "02",
      title: "Paint & layer",
      detail: "Target regions with independent, editable masks.",
    },
    {
      number: "03",
      title: "Validate & export",
      detail: "Review geometry before creating a printable mesh.",
    },
  ],
  footer: {
    licenseLabel: "Sample asset licenses",
    browserNote: "Designed for recent desktop browsers with WebGL 2.",
  },
} as const;
