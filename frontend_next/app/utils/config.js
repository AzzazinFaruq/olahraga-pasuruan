// Use internal proxy to avoid mixed content issues
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

export const getImageURL = (imagePath) => {
  if (!imagePath) return null;
  return `${API_BASE_URL}/${imagePath}`;
};
