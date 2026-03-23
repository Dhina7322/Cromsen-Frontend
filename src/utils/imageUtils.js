export const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // 1. If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // 2. If it starts with /uploads/ or uploads/, clean it up 
  // to ensure we don't double prepend
  const cleanPath = filename.startsWith('/') ? filename.slice(1) : filename;
  
  const UPLOAD_BASE = (import.meta.env.VITE_API_URL || "").replace('/api', '') || "";
  
  // 3. Construct the final URL
  if (cleanPath.startsWith('uploads/')) {
    return `${UPLOAD_BASE}/${cleanPath}`;
  }

  // Otherwise prepend uploads/
  return `${UPLOAD_BASE}/uploads/${cleanPath}`;
};
