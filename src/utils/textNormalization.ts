/**
 * Normalize text for loose comparison (used in speech recognition)
 * Removes punctuation, digits, and ALL whitespace (including spaces between letters)
 * This handles cases where:
 * 1. Students spell out words: "t h r e e" → "three"
 * 2. Speech recognition converts numbers to digits: "3" → should match "three"
 * 3. Various punctuation and special characters are added
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0-9]/g, '') // Remove all digits (numbers)
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, '') // Remove punctuation
    .replace(/\s+/g, '') // Remove ALL whitespace (including spaces between letters)
    .trim();
}

/**
 * Strict comparison for exact text match (used in keyboard input)
 * Performs case-sensitive and punctuation-sensitive comparison
 */
export function strictCompare(input: string, target: string): boolean {
  return input.trim() === target.trim();
}
