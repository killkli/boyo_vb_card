/**
 * Utility functions for handling optimized WebP images
 */

/**
 * Get the WebP image path
 * @param originalPath Original image path (will be converted to WebP)
 * @returns WebP image path
 */
export function getOptimizedImagePath(originalPath: string): string {
  // Convert PNG path to WebP path
  return originalPath.replace('.png', '.webp');
}

/**
 * Preload an image to check if it exists
 * @param src Image source URL
 * @returns Promise that resolves if image loads, rejects if it fails
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
