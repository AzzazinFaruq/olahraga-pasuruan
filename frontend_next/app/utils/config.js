// Use internal proxy to avoid mixed content issues
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

// Backend URL untuk akses langsung ke static files
export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export const getImageURL = (imagePath) => {
  if (!imagePath) return null;
  // Untuk static files, akses langsung ke backend
  return `${BACKEND_BASE_URL}/${imagePath}`;
};

export const getDocumentURL = (documentPath) => {
  if (!documentPath) return null;
  // Untuk dokumentasi, akses langsung ke backend
  return `${BACKEND_BASE_URL}/${documentPath}`;
};
