/**
 * Normalize text for loose comparison (used in speech recognition)
 * Removes punctuation and converts to lowercase
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Strict comparison for exact text match (used in keyboard input)
 * Performs case-sensitive and punctuation-sensitive comparison
 */
export function strictCompare(input: string, target: string): boolean {
  return input.trim() === target.trim();
}
