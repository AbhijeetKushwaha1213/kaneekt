
/**
 * Utility functions for image handling
 */

/**
 * Checks if a URL is a valid image URL by attempting to load it
 * @param url The URL to check
 * @returns Promise that resolves to true if the image can be loaded, false otherwise
 */
export const isImageUrlValid = (url: string): Promise<boolean> => {
  if (!url) return Promise.resolve(false);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Gets a fallback avatar URL based on a name
 * @param name User name
 * @returns URL to an avatar
 */
export const getFallbackAvatar = (name?: string): string => {
  if (!name) return "/placeholder.svg";
  const initial = name.charAt(0).toUpperCase();
  // You could implement additional logic here to get different avatar styles
  return `/placeholder.svg`;
};
