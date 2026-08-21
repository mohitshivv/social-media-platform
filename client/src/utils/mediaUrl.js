// The backend (Render) serves uploaded photos/videos from paths like "/uploads/xyz.jpg".
// Since the frontend (Netlify) and backend (Render) live on different domains in production,
// a plain "/uploads/xyz.jpg" would be requested from the Netlify domain and 404.
// This helper turns that short path into a full URL pointing at the actual backend.

const API_URL = import.meta.env.VITE_API_URL || "/api";
// Strip a trailing "/api" (or "/api/") to get just the backend's origin.
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const getMediaUrl = (path) => {
  if (!path) return path;
  // Already a full URL (e.g. dicebear placeholder avatars) — leave it alone.
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_ORIGIN}${path}`;
};
