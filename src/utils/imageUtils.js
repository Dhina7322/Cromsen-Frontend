export const getImageUrl = (filename) => {
  if (!filename) return null;
  // If it's already a full URL (like from Unsplash or an external source), return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  // Otherwise, prepend the backend URL for uploaded files
  // Using the same URL format used in the Admin dashboard
  return `http://localhost:5001/uploads/${filename}`;
};
