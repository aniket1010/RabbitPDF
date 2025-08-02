/**
 * A simple in-memory cache for storing PDF object URLs.
 * This prevents re-downloading and re-creating URLs for the same PDF
 * when navigating between conversations.
 */
// Global PDF cache to store blob URLs
export const globalPDFCache = new Map<string, string>();

// Clean up cache when needed
export const clearPDFCache = () => {
  for (const [key, url] of globalPDFCache) {
    URL.revokeObjectURL(url);
  }
  globalPDFCache.clear();
};

// Remove specific cache entry
export const removePDFCache = (conversationId: string) => {
  const url = globalPDFCache.get(conversationId);
  if (url) {
    URL.revokeObjectURL(url);
    globalPDFCache.delete(conversationId);
  }
}; 