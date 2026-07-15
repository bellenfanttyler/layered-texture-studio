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
    dropHint: "or choose an STL, OBJ, GLB, or GLTF file",
    chooseFile: "Choose model file",
    selectedFile: "Local model selected",
    sampleHeading: "Start with a sample",
    sampleSubheading:
      "Choose one model and any textures you want waiting in your project.",
    modelGroup: "Sample models",
    textureGroup: "Sample textures",
    selectionEmpty: "Select a model to begin your sample setup.",
    selectionReady: "Sample setup ready",
    privacy: "Your files stay on this device. Nothing is uploaded.",
    initializationNote:
      "This repository milestone prepares project selection and the application foundation. Mesh editing is not yet exposed.",
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
