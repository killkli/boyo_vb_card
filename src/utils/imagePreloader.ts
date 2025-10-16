/**
 * Preload an image and return a promise that resolves when loaded
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images in parallel
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  try {
    await Promise.all(srcs.map(src => preloadImage(src)));
  } catch (error) {
    console.error('Error preloading images:', error);
    // Don't throw - allow the app to continue even if some images fail
  }
}

/**
 * Preload images for adjacent cards (previous, current, next)
 */
export function preloadAdjacentImages(
  allCards: { imagePath: string }[],
  currentIndex: number,
  preloadCount: number = 3
): Promise<void> {
  const imagesToPreload: string[] = [];

  // Preload previous, current, and next images
  for (let i = -preloadCount; i <= preloadCount; i++) {
    const index = currentIndex + i;
    if (index >= 0 && index < allCards.length) {
      imagesToPreload.push(allCards[index].imagePath);
    }
  }

  return preloadImages(imagesToPreload);
}
