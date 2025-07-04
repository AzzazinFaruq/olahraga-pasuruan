// Use internal proxy to avoid mixed content issues
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

// Dynamic backend URL detection for production/development
const getBackendURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current domain with backend port
    const { protocol, hostname } = window.location;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    
    if (isProduction) {
      // Production: untuk static files, gunakan proxy atau subdomain
      // Opsi 1: Gunakan environment variable untuk URL yang benar
      // Opsi 2: Gunakan subdomain yang sudah dikonfigurasi SSL
      return process.env.NEXT_PUBLIC_BACKEND_URL || `${protocol}//${hostname}`;
    }
  }
  
  // Development or server-side
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
};

// Backend URL untuk akses langsung ke static files
export const BACKEND_BASE_URL = getBackendURL();

export const getImageURL = (imagePath) => {
  if (!imagePath) return null;
  
  // Check if we're in production (HTTPS frontend)
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    
    if (isProduction) {
      // Production: use static proxy to avoid mixed content issues
      console.log('Production mode - using static proxy for:', imagePath);
      return `/api/static/${imagePath}`;
    }
  }
  
  // Development: direct access to backend
  const url = `${BACKEND_BASE_URL}/${imagePath}`;
  
  // Debug log untuk troubleshooting
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.log('Image URL generated:', url);
    console.log('Backend Base URL:', BACKEND_BASE_URL);
    console.log('Image Path:', imagePath);
  }
  
  return url;
};

export const getDocumentURL = (documentPath) => {
  if (!documentPath) return null;
  
  // Check if we're in production (HTTPS frontend)
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    
    if (isProduction) {
      // Production: use static proxy to avoid mixed content issues
      console.log('Production mode - using static proxy for:', documentPath);
      return `/api/static/${documentPath}`;
    }
  }
  
  // Development: direct access to backend
  const url = `${BACKEND_BASE_URL}/${documentPath}`;
  
  // Debug log untuk troubleshooting
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.log('Document URL generated:', url);
  }
  
  return url;
};
