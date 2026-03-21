export const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // 1. If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // 2. If it starts with /uploads/ or uploads/, clean it up 
  // to ensure we don't double prepend
  const cleanPath = filename.startsWith('/') ? filename.slice(1) : filename;
  
  // 3. Construct the final URL (using relative path so Vite proxy handles it)
  // If cleanPath already starts with 'uploads/', use it directly
  if (cleanPath.startsWith('uploads/')) {
    return `/${cleanPath}`;
  }

  // Otherwise prepend uploads/
  return `/uploads/${cleanPath}`;
};
