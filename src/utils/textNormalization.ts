// Number to word mapping for common vocabulary numbers
const numberToWord: Record<string, string> = {
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  '20': 'twenty',
  '30': 'thirty',
  '40': 'forty',
  '50': 'fifty',
  '60': 'sixty',
  '70': 'seventy',
  '80': 'eighty',
  '90': 'ninety',
  '100': 'hundred',
};

/**
 * Convert numbers to their word equivalents
 * Handles common vocabulary numbers: 1-10, 20, 30, 40, 50, 60, 70, 80, 90, 100
 */
function convertNumbersToWords(text: string): string {
  let result = text;

  // Sort by length (descending) to match longer numbers first (e.g., "100" before "10")
  const sortedNumbers = Object.keys(numberToWord).sort((a, b) => b.length - a.length);

  for (const num of sortedNumbers) {
    // Replace standalone numbers (with word boundaries)
    const regex = new RegExp(`\\b${num}\\b`, 'g');
    result = result.replace(regex, numberToWord[num]);
  }

  return result;
}

/**
 * Normalize text for loose comparison (used in speech recognition)
 * Handles multiple edge cases:
 * 1. Students spell out words: "t h r e e" → "three"
 * 2. Speech recognition converts numbers to digits: "3" → "three"
 * 3. Various punctuation and special characters
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // First normalize multiple spaces to single space
    .split(' ') // Split by spaces to handle word boundaries for number conversion
    .map(word => convertNumbersToWords(word)) // Convert numbers in each word
    .join(' ') // Rejoin
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, '') // Remove punctuation
    .replace(/\s+/g, ''); // Remove ALL whitespace (including spaces between letters)
}

/**
 * Strict comparison for exact text match (used in keyboard input)
 * Performs case-sensitive and punctuation-sensitive comparison
 */
export function strictCompare(input: string, target: string): boolean {
  return input.trim() === target.trim();
}
