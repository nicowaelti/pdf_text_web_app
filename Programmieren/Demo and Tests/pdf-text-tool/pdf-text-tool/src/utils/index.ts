// Utility functions will be exported from here
export const createFileId = (filename: string): string => {
  return `${filename}-${Date.now()}`;
};