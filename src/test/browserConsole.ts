const issueTypes = new Set(["error", "warning"]);

const isChromiumReadPixelsDriverWarning = (
  type: string,
  message: string,
): boolean =>
  type === "warning" &&
  message.includes("GL Driver Message") &&
  message.includes("GPU stall due to ReadPixels");

export const isActionableBrowserIssue = (
  type: string,
  message: string,
): boolean =>
  issueTypes.has(type) && !isChromiumReadPixelsDriverWarning(type, message);
